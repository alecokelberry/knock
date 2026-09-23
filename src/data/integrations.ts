// Settings → Integrations: the tools Vantage's workspace can connect, the partner's service file first, which are connected, and each brand's mark
// (inline SVG, ids made unique here). `docs` is the vendor's developer docs.

export type Integration = {
  id: string
  name: string
  description: string
  connected: boolean
  docs: string
  logo: string
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "ridgeline",
    name: "Ridgeline Pest",
    description:
      "The partner's service file: every account serviced or cancelled, matched to our sales each night.",
    connected: true,
    docs: "https://example.com/ridgeline/api",
    logo: '<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#14532d"></rect><path d="M4 23 12 12l5 6 4-4 7 9z" fill="#4ade80"></path><path d="m12 12 2.6 3.1L12 18.5 9.3 16.7z" fill="#bbf7d0"></path></svg>',
  },
  {
    id: "payroll",
    name: "Payroll export",
    description:
      "Biweekly draws and the season-end back-end check, sent to payroll with every hold explained.",
    connected: true,
    docs: "https://example.com/knock/payroll",
    logo: '<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#1e3a8a"></rect><rect x="6" y="10" width="20" height="12" rx="2" fill="#93c5fd"></rect><circle cx="16" cy="16" r="3" fill="#1e3a8a"></circle></svg>',
  },
  {
    id: "esign",
    name: "E-sign",
    description:
      "Agreements signed on the tablet, with the three-day cancellation notice attached.",
    connected: true,
    docs: "https://example.com/knock/e-sign",
    logo: '<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#7c2d12"></rect><path d="M7 22c3-5 5-8 7-8s-1 6 1 6 3-4 5-4 1 3 3 3 2-1 2-1" stroke="#fdba74" stroke-width="2" stroke-linecap="round" fill="none"></path><path d="M7 25h18" stroke="#fed7aa" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Sale shout-outs, cancel alerts and approvals in each office's channel.",
    connected: true,
    docs: "https://api.slack.com/docs",
    logo: '<svg viewBox="0 0 2447.6 2452.5"><g clip-rule="evenodd" fill-rule="evenodd"><path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0"></path><path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d"></path><path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e"></path><path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a"></path></g></svg>',
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cards on file at the door, charged at the first service.",
    connected: true,
    docs: "https://docs.stripe.com",
    logo: '<svg fill="none" viewBox="100 100 312 312"><path fill="#533afd" fill-rule="evenodd" d="m120 392 272-57.683V120l-272 58.357z" clip-rule="evenodd"></path></svg>',
  },
  {
    id: "n8n",
    name: "N8n",
    description: "Brings Ridgeline's service file into Knock every night.",
    connected: true,
    docs: "https://docs.n8n.io",
    logo: '<svg viewBox="0 0 228 120"><path fill-rule="evenodd" clip-rule="evenodd" d="M204 48C192.817 48 183.42 40.3514 180.756 30H153.248C147.382 30 142.376 34.241 141.412 40.0272L140.425 45.9456C139.489 51.5648 136.646 56.4554 132.626 60C136.646 63.5446 139.489 68.4352 140.425 74.0544L141.412 79.9728C142.376 85.759 147.382 90 153.248 90H156.756C159.42 79.6486 168.817 72 180 72C193.255 72 204 82.7452 204 96C204 109.255 193.255 120 180 120C168.817 120 159.42 112.351 156.756 102H153.248C141.516 102 131.504 93.5181 129.575 81.9456L128.588 76.0272C127.624 70.241 122.618 66 116.752 66H107.244C104.58 76.3514 95.183 84 84 84C72.817 84 63.4204 76.3514 60.7561 66H47.2439C44.5796 76.3514 35.183 84 24 84C10.7452 84 0 73.2548 0 60C0 46.7452 10.7452 36 24 36C35.183 36 44.5796 43.6486 47.2439 54H60.7561C63.4204 43.6486 72.817 36 84 36C95.183 36 104.58 43.6486 107.244 54H116.752C122.618 54 127.624 49.759 128.588 43.9728L129.575 38.0544C131.504 26.4819 141.516 18 153.248 18L180.756 18C183.42 7.64864 192.817 0 204 0C217.255 0 228 10.7452 228 24C228 37.2548 217.255 48 204 48ZM204 36C210.627 36 216 30.6274 216 24C216 17.3726 210.627 12 204 12C197.373 12 192 17.3726 192 24C192 30.6274 197.373 36 204 36ZM24 72C30.6274 72 36 66.6274 36 60C36 53.3726 30.6274 48 24 48C17.3726 48 12 53.3726 12 60C12 66.6274 17.3726 72 24 72ZM96 60C96 66.6274 90.6274 72 84 72C77.3726 72 72 66.6274 72 60C72 53.3726 77.3726 48 84 48C90.6274 48 96 53.3726 96 60ZM192 96C192 102.627 186.627 108 180 108C173.373 108 168 102.627 168 96C168 89.3726 173.373 84 180 84C186.627 84 192 89.3726 192 96Z" fill="#ea4b71"></path></svg>',
  },
  {
    id: "zoom",
    name: "Zoom",
    description:
      "Morning meetings and trainings for offices a manager can't reach.",
    connected: false,
    docs: "https://developers.zoom.us/docs/",
    logo: '<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><defs><linearGradient id="zoom-_R_2lclubsnqn5ulb_" x1="23.666%" x2="76.334%" y1="95.6118%" y2="4.3882%"><stop offset=".00006%" stop-color="#0845BF"></stop><stop offset="19.11%" stop-color="#0950DE"></stop><stop offset="38.23%" stop-color="#0B59F6"></stop><stop offset="50%" stop-color="#0B5CFF"></stop><stop offset="67.32%" stop-color="#0E5EFE"></stop><stop offset="77.74%" stop-color="#1665FC"></stop><stop offset="86.33%" stop-color="#246FF9"></stop><stop offset="93.88%" stop-color="#387FF4"></stop><stop offset="100%" stop-color="#4F90EE"></stop></linearGradient></defs><path fill="url(#zoom-_R_2lclubsnqn5ulb_)" d="M256 128c0 13.568-1.024 27.136-3.328 40.192-6.912 43.264-41.216 77.568-84.48 84.48C155.136 254.976 141.568 256 128 256c-13.568 0-27.136-1.024-40.192-3.328-43.264-6.912-77.568-41.216-84.48-84.48C1.024 155.136 0 141.568 0 128c0-13.568 1.024-27.136 3.328-40.192 6.912-43.264 41.216-77.568 84.48-84.48C100.864 1.024 114.432 0 128 0c13.568 0 27.136 1.024 40.192 3.328 43.264 6.912 77.568 41.216 84.48 84.48C254.976 100.864 256 114.432 256 128Z"></path><path fill="#FFF" d="M204.032 207.872H75.008c-8.448 0-16.64-4.608-20.48-12.032-4.608-8.704-2.816-19.2 4.096-26.112l89.856-89.856H83.968c-17.664 0-32-14.336-32-32h118.784c8.448 0 16.64 4.608 20.48 12.032 4.608 8.704 2.816 19.2-4.096 26.112l-89.6 90.112h74.496c17.664 0 32 14.08 32 31.744Z"></path></svg>',
  },
  {
    id: "loom",
    name: "Loom",
    description: "Pitch recordings and ride-along recaps for the rookies.",
    connected: true,
    docs: "https://dev.loom.com/docs",
    logo: '<svg viewBox="0 0 256 256" preserveAspectRatio="xMidYMid"><path fill="#625DF5" d="M256 113.765h-74.858l64.83-37.43-14.237-24.667-64.83 37.43 37.421-64.825-24.667-14.246-37.421 64.826V0h-28.476v74.86L76.326 10.027 51.667 24.266 89.096 89.09 24.265 51.668l-14.238 24.66 64.83 37.43H0v28.477h74.85l-64.823 37.43 14.238 24.667 64.824-37.423-37.43 64.825 24.667 14.239 37.429-64.832V256h28.476v-74.853l37.422 64.826 24.665-14.239-37.428-64.832 64.83 37.43 14.24-24.667-64.825-37.423h74.85v-28.477H256ZM128 166.73c-21.472 0-38.876-17.403-38.876-38.876 0-21.472 17.404-38.876 38.876-38.876 21.472 0 38.875 17.404 38.875 38.876 0 21.473-17.403 38.876-38.875 38.876Z"></path></svg>',
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Drafts callback texts from a rep's notes at the door.",
    connected: false,
    docs: "https://ai.google.dev/gemini-api/docs",
    logo: '<svg viewBox="0 0 296 298" fill="none"><mask id="gemini-a" width="296" height="298" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#3186FF" d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"></path></mask><g mask="url(#gemini-a)"><g filter="url(#gemini-b)"><ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159"></ellipse></g><g filter="url(#gemini-c)"><ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5"></ellipse></g><g filter="url(#gemini-d)"><ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5"></ellipse></g><g filter="url(#gemini-e)"><path fill="#FA4340" d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"></path></g><g filter="url(#gemini-f)"><path fill="#FA4340" d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"></path></g><g filter="url(#gemini-g)"><path fill="#14BB69" d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"></path></g><g filter="url(#gemini-h)"><path fill="#14BB69" d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"></path></g></g><defs><filter id="gemini-b" width="464" height="390" x="-69" y="-46" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="18"></feGaussianBlur></filter><filter id="gemini-c" width="265" height="273" x="-99" y="6" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter><filter id="gemini-d" width="265" height="273" x="-113" y="12" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter><filter id="gemini-e" width="299.5" height="329" x="-41.5" y="-130" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter><filter id="gemini-f" width="299.5" height="329" x="-45" y="-153" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter><filter id="gemini-g" width="299.5" height="329" x="-41" y="91" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter><filter id="gemini-h" width="299.5" height="329" x="-39" y="132" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"></feGaussianBlur></filter></defs></svg>',
  },
]
