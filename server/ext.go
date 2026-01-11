package naniue

import (
	. "naniue-srv/gen"
)

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
