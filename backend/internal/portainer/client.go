package portainer

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
)

type ContainerConfig struct {
  Image string   `json:"Image"`
  Cmd   []string `json:"Cmd,omitempty"`
  Labels map[string]string `json:"Labels,omitempty"`
}

func LaunchContainer(baseURL, apiKey string, cfg ContainerConfig) (string, error) {
  client := &http.Client{}
  body, _ := json.Marshal(cfg)
  req, _ := http.NewRequest("POST", fmt.Sprintf("%s/endpoints/1/docker/containers/create?name=session", baseURL), bytes.NewBuffer(body))
  req.Header.Add("x-api-key", apiKey)
  req.Header.Add("Content-Type", "application/json")

  res, err := client.Do(req)
  if err != nil {
    return "", err
  }
  defer res.Body.Close()
  if res.StatusCode >= 300 {
    b, _ := io.ReadAll(res.Body)
    return "", fmt.Errorf("portainer error: %s", string(b))
  }
  var result map[string]string
  json.NewDecoder(res.Body).Decode(&result)
  id := result["Id"]

  // start container
  startReq, _ := http.NewRequest("POST", fmt.Sprintf("%s/endpoints/1/docker/containers/%s/start", baseURL, id), nil)
  startReq.Header.Add("x-api-key", apiKey)
  client.Do(startReq)

  return id, nil
}
