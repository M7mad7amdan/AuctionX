import http from "k6/http"
import { check, sleep } from "k6"

const BASE_URL = "http://localhost:5000"

// اعمل Auction جديد مخصص للاختبار
const AUCTION_ID = 3

const USERS = 100

export const options = {
  scenarios: {
    mixed_users: {
      executor: "constant-vus",
      vus: USERS,
      duration: "1m",
    },
  },

  thresholds: {
    "http_req_duration{type:browse}": ["p(95)<500"],
    "http_req_duration{type:bid}": ["p(95)<500"],
  },
}


// ==========================================
// CREATE TEST USERS
// ==========================================

export function setup() {
  const users = []
  const timestamp = Date.now()

  for (let i = 0; i < USERS; i++) {
    const email =
      `mixedload${timestamp}${i}@gmail.com`

    const response = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({
        name: "Mixed Load User",
        email,
        password: "Test12345",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },

        tags: {
          type: "setup",
        },
      }
    )

    if (response.status === 201) {
      users.push({
        token: response.json("token"),
      })
    } else {
      console.log(
        `Registration failed: ${response.status} ${response.body}`
      )
    }
  }

  console.log(`Created ${users.length} mixed-load users`)

  return { users }
}


// ==========================================
// REALISTIC USER
// ==========================================

export default function (data) {
  const user =
    data.users[(__VU - 1) % data.users.length]

  if (!user) {
    return
  }

  // ------------------------------------------
  // 1. Browse auctions
  // ------------------------------------------

  const auctionsResponse = http.get(
    `${BASE_URL}/auctions?page=1&limit=12`,
    {
      tags: {
        type: "browse",
      },
    }
  )

  check(auctionsResponse, {
    "auctions loaded": (res) =>
      res.status === 200,
  })

  if (auctionsResponse.status !== 200) {
    sleep(1)
    return
  }

  let auctions = []

  try {
    auctions =
      auctionsResponse.json("auctions") || []
  } catch {
    return
  }

  if (auctions.length === 0) {
    sleep(1)
    return
  }


  // ------------------------------------------
  // 2. Open random auction
  // ------------------------------------------

  const auction =
    auctions[
      Math.floor(Math.random() * auctions.length)
    ]

  const auctionId = auction.auctionid

  sleep(Math.random() * 2 + 1)

  const detailsResponse = http.get(
    `${BASE_URL}/auctions/${auctionId}`,
    {
      tags: {
        type: "browse",
      },
    }
  )

  check(detailsResponse, {
    "auction details loaded": (res) =>
      res.status === 200,
  })


  // ------------------------------------------
  // 3. Read bids
  // ------------------------------------------

  sleep(Math.random() * 2 + 1)

  const bidsResponse = http.get(
    `${BASE_URL}/bids/auction/${auctionId}`,
    {
      tags: {
        type: "browse",
      },
    }
  )

  check(bidsResponse, {
    "bids loaded": (res) =>
      res.status === 200,
  })


  // ------------------------------------------
  // 4. Around 10% of visits place a bid
  // ------------------------------------------

  if (Math.random() < 0.10) {

    // intentionally large/random bids
    // because concurrent requests can change
    // the current minimum very quickly

    const amount =
      1000000 +
      (__VU * 10000) +
      Math.floor(Math.random() * 10000)

    const bidResponse = http.post(
      `${BASE_URL}/bids/auction/${AUCTION_ID}`,
      JSON.stringify({
        amount,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${user.token}`,
        },

        tags: {
          type: "bid",
        },
      }
    )

    check(bidResponse, {
      "bid handled": (res) =>
        res.status === 201 ||
        res.status === 400,

      "bid no server error": (res) =>
        res.status < 500,
    })
  }


  // ------------------------------------------
  // 5. User stays on site
  // ------------------------------------------

  sleep(Math.random() * 3 + 1)
}