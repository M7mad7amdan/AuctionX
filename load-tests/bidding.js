import http from "k6/http"
import { check } from "k6"

const BASE_URL = "http://localhost:5000"

// غيّر هذا لرقم المزاد اللي بدنا نختبر عليه
const AUCTION_ID = 3

const USERS = 100

export const options = {
  vus: USERS,
  iterations: USERS,
}


// =============================
// CREATE TEST USERS
// =============================

export function setup() {
  const users = []

  const timestamp = Date.now()

  for (let i = 1; i <= USERS; i++) {

    const email =
      `loadtest${timestamp}${i}@gmail.com`

    const password =
      "Test12345"

    const response = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({
       name: "Loadtest User",
        email,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const success = check(response, {
      "user registered": (res) =>
        res.status === 201,

      "token received": (res) =>
        Boolean(res.json("token")),
    })

    if (!success) {
      console.log(
        `Register failed for user ${i}: ${response.status} ${response.body}`
      )

      continue
    }

    users.push({
      token: response.json("token"),
      number: i,
    })
  }

  console.log(
    `Created ${users.length} test users`
  )

  return {
    users,
  }
}


// =============================
// CONCURRENT BIDDING
// =============================

export default function (data) {

  const index = __VU - 1

  const user = data.users[index]

  if (!user) {
    console.log(
      `No user available for VU ${__VU}`
    )
    return
  }


  // كل مستخدم يعطي سعر مختلف
  // حتى ما تكون كل الطلبات بنفس القيمة

  const amount =
    10000 + (__VU * 1000)


  const response = http.post(
    `${BASE_URL}/bids/auction/${AUCTION_ID}`,
    JSON.stringify({
      amount,
    }),
    {
      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${user.token}`,
      },
    }
  )


  check(response, {

    "bid request handled": (res) =>
      res.status === 201 ||
      res.status === 400,

    "no server error": (res) =>
      res.status < 500,

  })


  console.log(
    `VU ${__VU} | Bid ${amount} | Status ${response.status}`
  )
}