FROM golang:1.19-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go mod tidy
RUN go build -o /webtop-launcher-backend ./cmd

EXPOSE 8080

CMD [ "/webtop-launcher-backend" ]