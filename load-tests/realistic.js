import http from "k6/http"
import { check, sleep } from "k6"

const BASE_URL = "http://localhost:5000"

export const options = {
  scenarios: {
    realistic_users: {
      executor: "constant-vus",
      vus: 100,
      duration: "1m",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
}

export default function () {

  // 1. Browse auctions
  const auctionsResponse = http.get(
    `${BASE_URL}/auctions?page=1&limit=12`
  )

  check(auctionsResponse, {
    "auctions loaded": (res) => res.status === 200,
  })

  if (auctionsResponse.status !== 200) {
    sleep(1)
    return
  }

  let body

  try {
    body = auctionsResponse.json()
  } catch {
    return
  }

  const auctions = body.auctions || []

  if (auctions.length === 0) {
    console.log("No auctions available")
    return
  }

  // 2. Pick random auction
  const auction =
    auctions[
      Math.floor(Math.random() * auctions.length)
    ]

  const auctionId = auction.auctionid

  // User thinks / scrolls
  sleep(Math.random() * 2 + 1)

  // 3. Open auction details
  const detailsResponse = http.get(
    `${BASE_URL}/auctions/${auctionId}`
  )

  check(detailsResponse, {
    "auction details loaded": (res) =>
      res.status === 200,
  })

  // User reads auction
  sleep(Math.random() * 3 + 1)

  // 4. Look at bids
  const bidsResponse = http.get(
    `${BASE_URL}/bids/auction/${auctionId}`
  )

  check(bidsResponse, {
    "bids loaded": (res) =>
      res.status === 200,
  })

  // User waits before continuing
  sleep(Math.random() * 2 + 1)
}