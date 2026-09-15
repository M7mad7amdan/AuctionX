import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  vus: 100,
  duration: "30s",
}

export default function () {
  const response = http.get(
    "http://localhost:5000/auctions?page=1&limit=12"
  )

  check(response, {
    "status is 200": (res) => res.status === 200,
    "response under 500ms": (res) =>
      res.timings.duration < 500,
  })

  sleep(1)
}