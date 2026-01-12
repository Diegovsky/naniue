package naniue

import (
	"log"
	. "naniue-srv/gen"
	"time"

	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DB = *gorm.DB

type DBModel struct {
	Id string `gorm:"primaryKey"`
}

func CreateOrUpdateClause() clause.OnConflict {
	return clause.OnConflict{Columns: []clause.Column{{Name: "id"}}}
}

func NewMessage(id string, sender string, chatID string, fromMe bool, message *waE2E.Message) *Message {
	text := message.GetConversation()
	forwarded := false
	if ext := message.ExtendedTextMessage; len(text) == 0 && ext != nil {
		text = ext.GetText()
		if ctx := ext.ContextInfo; ctx != nil {
			forwarded = ctx.GetIsForwarded()
		}
	}

	if len(text) == 0 {
		return nil
	}

	return Message_builder{
		Id:          id,
		SenderJid:   S(sender),
		ChatId:      S(chatID),
		Message:     S(text),
		FromMe:      fromMe,
		IsForwarded: forwarded,
	}.Build()

}

func NewDBMessage(msg *Message) DBMessage {
	return DBMessage{
		DBModel: DBModel{
			Id: msg.GetId(),
		},
		DBChatID:    msg.GetChatId(),
		Message:     msg.GetMessage(),
		IsForwarded: msg.GetIsForwarded(),
		FromMe:      msg.GetFromMe(),
		Timestamp:   msg.GetTimestamp().AsTime(),
	}
}

func NewChatFromDB(dbChat DBChat) *Chat {
	return Chat_builder{
		Name:             dbChat.Name,
		UnreadCount:      dbChat.UnreadCount,
		LastMsgTimestamp: timestamppb.New(dbChat.LastMsgTimestamp),
		Archived:         dbChat.Archived,
		Pinned:           dbChat.Pinned,
		ContactJid:       dbChat.ContactJid,
		PictureUrl:       dbChat.PictureUrl,
	}.Build()
}

type DBChat struct {
	DBModel
	Name             string
	UnreadCount      uint32
	LastMsgTimestamp time.Time
	Archived         bool
	Pinned           uint32
	ContactJid       string
	PictureUrl       string

	// Orm stuff
	Messages []DBMessage
}

type DBMessage struct {
	DBModel
	SenderJID   string
	DBChatID    string
	Message     string
	IsForwarded bool
	FromMe      bool
	Timestamp   time.Time
}

func InitDB() DB {
	db, err := gorm.Open(sqlite.Open("whatsapp-ext.db"), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	if err := db.Debug().AutoMigrate(&DBChat{}, &DBMessage{}); err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}

	return db

}

func NewProtoContact(jid types.JID, contact types.ContactInfo, pictureURL string) *Contact {
	return Contact_builder{
		Name:       GetName(contact),
		PictureUrl: pictureURL,
		Jid:        jid.String(),
	}.Build()
}

func LoginResAlive() *LoginRes {
	return LoginRes_builder{
		Alive: MakeEmpty(),
	}.Build()
}

func S(v string) string {
	return v
}

func MakeError(msg string) *Error {
	return Error_builder{Message: S(msg)}.Build()
}

func MakeEmpty() *Empty {
	return Empty_builder{}.Build()
}

func GetName(c types.ContactInfo) string {
	if len(c.FullName) != 0 {
		return c.FullName
	}

	if len(c.FirstName) != 0 {
		return c.FirstName
	}

	return c.RedactedPhone
}
