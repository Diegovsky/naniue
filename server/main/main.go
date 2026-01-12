package main

import (
	"context"
	"log"
	. "naniue-srv"
	. "naniue-srv/gen"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	. "github.com/goforj/godump"
	"gorm.io/gorm"

	"connectrpc.com/connect"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	"gopkg.in/typ.v4/chans"
)

type Naniue struct {
	db        DB
	client    *whatsmeow.Client
	listeners chans.PubSub[*Message]
}

func (self *Naniue) Login(ctx context.Context, _ *Empty) (*LoginRes, error) {
	client := self.client
	if client.IsConnected() {
		return LoginResAlive(), nil
	}

	if client.Store.ID == nil {
		// No ID stored, new login
		qrChan, _ := client.GetQRChannel(context.Background())
		err := client.Connect()
		if err != nil {
			panic(err)
		}
		for evt := range qrChan {
			switch evt.Event {
			case whatsmeow.QRChannelEventCode:
				code := AuthCode_builder{
					Type:  *AuthMethod_QR_CODE.Enum(),
					Value: S(evt.Code),
				}.Build()

				return LoginRes_builder{
					Code: code,
				}.Build(), nil
			case whatsmeow.QRChannelEventError:
				log.Printf("Login error: %v\n", evt.Error)
				return LoginRes_builder{
					Error: MakeError("Qr code error"),
				}.Build(), nil
			default:
				log.Printf("Login event: %v", evt.Event)
			}

		}
		panic("Unreachable")
	} else {
		// Already logged in, just connect
		err := client.Connect()
		if err != nil {
			log.Printf("Login connect error: %v\n", err)
			return LoginRes_builder{
				Error: MakeError("Qr code error"),
			}.Build(), nil
		}
		return LoginResAlive(), nil
	}

}
func (self *Naniue) GetContacts(ctx context.Context, req *Empty) (*Contacts, error) {
	log.Printf("Requesting contacts")
	contacts, err := self.client.Store.Contacts.GetAllContacts(ctx)
	if err != nil {
		return nil, err
	}
	var contactList []*Contact
	log.Printf("Building list")
	for jid, contact := range contacts {
		protoContact := NewProtoContact(jid, contact, "")
		if len(protoContact.GetName()) == 0 {
			continue
		}
		contactList = append(contactList, protoContact)
	}
	log.Printf("Returning")
	return Contacts_builder{Contacts: contactList}.Build(), nil

}
func (self *Naniue) GetChats(ctx context.Context, _ *Empty) (*Chats, error) {
	res, err := gorm.G[DBChat](self.db).Find(ctx)
	if err == nil {
		return nil, err
	}
	var chats []*Chat
	for _, dbChat := range res {
		chats = append(chats, NewChatFromDB(dbChat))
	}
	return Chats_builder{Chats: chats}.Build(), nil
}

func (self *Naniue) GetChat(ctx context.Context, req *GetById) (*Chat, error) {
	res, err := gorm.G[DBChat](self.db).Select("id = ?", req.GetId()).First(ctx)
	if err != nil {
		return nil, err
	}
	return NewChatFromDB(res), nil
}

func (self *Naniue) GetContact(ctx context.Context, req *GetById) (*Contact, error) {

	jid, err := types.ParseJID(req.GetId())
	if err != nil {
		return nil, err
	}
	contact, err := self.client.Store.Contacts.GetContact(ctx, jid)
	if err != nil {
		return nil, err
	}
	pictureURL, _ := self.GetContactPicture(jid, true)
	return NewProtoContact(jid, contact, pictureURL), nil
}
func (self *Naniue) SendMessage(ctx context.Context, req *SendMessageReq) (*Empty, error) {

	panic("todo()")
}
func (self *Naniue) SubscribeMessages(_ context.Context, _ *Empty, stream *connect.ServerStream[Message]) error {

	messages := self.listeners.Sub()
	defer self.listeners.Unsub(messages)

	for msg := range messages {
		if err := stream.Send(msg); err != nil {
			break
		}
	}

	return nil
}

func (self *Naniue) eventHandler(evt any) {
	ctx := context.Background()
	switch v := evt.(type) {
	case *events.Message:
		log.Printf("Received a message:\nFrom:\n%sMessage:\n%s", DumpStr(v.Info), DumpStr(v.Message))
		message := NewMessage(v.Info.ID, v.Info.Sender.String(), v.Info.ID, v.Info.IsFromMe, v.Message)
		dbMessage := NewDBMessage(message)
		gorm.G[DBMessage](self.db).Create(ctx, &dbMessage)
		self.listeners.Pub(message)
	case *events.HistorySync:
		ctx := context.Background()
		for _, convo := range v.Data.GetConversations() {
			log.Printf("Sync convo:\n%s", DumpStr(*convo))
			gorm.G[DBChat](self.db, CreateOrUpdateClause()).Create(ctx, &DBChat{
				DBModel: DBModel{
					Id: *convo.ID,
				},
				Name:        convo.GetName(),
				UnreadCount: convo.GetUnreadCount(),
				Archived:    convo.GetArchived(),
				Pinned:      convo.GetPinned(),
				ContactJid:  convo.GetAccountLid(),
			})
			for _, msg := range convo.GetMessages() {
				key := msg.Message.Key
				log.Printf("Key: %s", DumpStr(key))
				message := NewMessage(
					key.GetID(),
					key.GetParticipant(),
					key.GetRemoteJID(),
					key.GetFromMe(),
					msg.Message.Message)
				dbMessage := NewDBMessage(message)
				self.listeners.Pub(message)
				gorm.G[DBMessage](self.db, CreateOrUpdateClause()).Create(ctx, &dbMessage)
			}
		}
	}

}

func (self *Naniue) GetContactPicture(jid types.JID, isPreview bool) (string, error) {
	info, err := self.client.GetProfilePictureInfo(context.Background(), jid, &whatsmeow.GetProfilePictureParams{Preview: isPreview})
	if err != nil {
		return "", err
	}
	return info.URL, nil
}

func main() {
	wpp := Naniue{
		client: InitWpp(),
		db:     InitDB(),
	}
	wpp.client.AddEventHandler(wpp.eventHandler)

	mux := http.NewServeMux()
	path, handler := NewWppHandler(&wpp)

	mux.Handle(path, handler)

	corsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set global CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // tighten for production
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Grpc-Web, connect-protocol-version")
		w.Header().Set("Access-Control-Expose-Headers", "Grpc-Status, Grpc-Message, Grpc-Encoding, Grpc-Accept-Encoding, X-Grpc-Web, connect-protocol-version")

		// Preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Pass through to actual handler
		mux.ServeHTTP(w, r)
	})

	p := new(http.Protocols)
	p.SetHTTP1(true)
	p.SetUnencryptedHTTP2(true)

	s := http.Server{
		Addr:      "localhost:8000",
		Handler:   corsHandler,
		Protocols: p,
	}

	go func() {
		// Listen to Ctrl+C (you can also do something else that prevents the program from exiting)
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		<-c

		s.Shutdown(context.Background())

	}()
	log.Println("Server starting...")
	s.ListenAndServe()

}
