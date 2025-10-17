FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
