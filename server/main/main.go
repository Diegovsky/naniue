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

	"connectrpc.com/connect"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types/events"
	"gopkg.in/typ.v4/chans"
)

type Naniue struct {
	client    *whatsmeow.Client
	listeners chans.PubSub[*Message]
}

func (self *Naniue) Login(ctx context.Context, req *LoginReq) (*LoginRes, error) {
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
func (self *Naniue) GetContacts(context.Context, *BaseReq) (*Contacts, error) {
	panic("todo()")

}
func (self *Naniue) GetContact(context.Context, *GetContactReq) (*Contact, error) {

	panic("todo()")
}
func (self *Naniue) SendMessage(context.Context, *SendMessageReq) (*Empty, error) {

	panic("todo()")
}
func (self *Naniue) SubscribeMessages(_ context.Context, _ *BaseReq, stream *connect.ServerStream[Message]) error {

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
	switch v := evt.(type) {
	case *events.Message:
		log.Printf("Received a message:\nFrom:\n%sMessage:\n%s", DumpStr(v.Info), DumpStr(v.Message))

		msg := v.Message.GetConversation()
		forwarded := false
		if ext := v.Message.ExtendedTextMessage; len(msg) == 0 && ext != nil {
			msg = *ext.Text
			if ctx := ext.ContextInfo; ctx != nil {
				forwarded = *ctx.IsForwarded
			}
		}

		message := Message_builder{
			FromJid:     S(v.Info.Sender.String()),
			Message:     S(msg),
			IsForwarded: forwarded,
			ChatId:      S(v.Info.ID),
		}.Build()

		self.listeners.Pub(message)
	}
}

func main() {
	wpp := Naniue{
		client: InitWpp(),
	}
	wpp.client.AddEventHandler(wpp.eventHandler)

	mux := http.NewServeMux()
	path, handler := NewWppHandler(&wpp)

	mux.Handle(path, handler)

	corsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set global CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // tighten for production
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Grpc-Web")
		w.Header().Set("Access-Control-Expose-Headers", "Grpc-Status, Grpc-Message, Grpc-Encoding, Grpc-Accept-Encoding, X-Grpc-Web")

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
