// Home → Today: Tessa's Thursday as cards (the morning meeting, the pipeline review, the area drops, tomorrow's first
// services and a callback), the sidebar's Up next, the date menu, and the New meeting form's options. Times are
// Mountain, where Tessa sits; Raleigh is two hours ahead and Phoenix one behind.

export type Meeting = {
  id: string
  title: string
  time: string
  duration: string
  body: string
  attendees: string[]
  /** Attendees beyond the three faces, shown as "+n" */
  more?: number
  tag: string
}

/** Today's schedule, in time order */
export const MEETINGS: Meeting[] = [
  {
    id: "m1",
    title: "Boise - Morning Meeting",
    time: "09:30 AM MT",
    duration: "45 min",
    body: "Wednesday's numbers, then role-play on the termite pitch. Kyle rides along with Darnell after.",
    attendees: ["Julia Serrano", "Darnell Brooks", "Kirsten Vogt"],
    more: 1,
    tag: "Meeting",
  },
  {
    id: "m2",
    title: "Pipeline Review",
    time: "11:00 AM MT",
    duration: "1 hour",
    body: "Walk the 18 households on the board with the three sales managers, starting with the four at risk.",
    attendees: ["Julia Serrano", "Rafael Lima", "Mateo Alvarez"],
    tag: "Review",
  },
  {
    id: "m3",
    title: "Raleigh - Area Drop, Wakefield Glen",
    time: "12:00 PM MT",
    duration: "30 min",
    body: "Meera and Toby start the north loop; Ayesha takes the cul-de-sacs off Glen Laurel Drive.",
    attendees: ["Ayesha Malik", "Toby Marsh", "Meera Iyer"],
    tag: "Area drop",
  },
  {
    id: "m4",
    title: "Phoenix - Area Drop, Palo Verde Estates",
    time: "04:00 PM MT",
    duration: "30 min",
    body: "Heat advisory until 5. Sam starts the team on the shaded streets; doors after five, local time.",
    attendees: ["Sam Okafor", "Haruka Mori", "Owen Fletcher"],
    tag: "Area drop",
  },
  {
    id: "m5",
    title: "Ridgeline - Tomorrow's First Services",
    time: "05:00 PM MT",
    duration: "30 min",
    body: "Grant confirms Friday's route with Ridgeline: Nathan Pryce first, then eleven more in Boise.",
    attendees: ["Grant Lowell", "Kirsten Vogt"],
    tag: "Service",
  },
  {
    id: "m6",
    title: "Harriet Lawson - Callback",
    time: "06:30 PM MT",
    duration: "30 min",
    body: "Darnell comes back with Quarterly Pest and Mosquito Season; her husband decides. Termite sheet in hand.",
    attendees: ["Darnell Brooks", "Harriet Lawson"],
    tag: "Callback",
  },
]

/** The sidebar's "Up next" card (on the Activities pages): time, length, where, what, who, and the Lucide icon. */
export const UP_NEXT = {
  time: "09:30 AM",
  minutes: 45,
  icon: "users",
  place: "Boise office",
  title: "Morning Meeting",
  attendees: ["Julia Serrano", "Darnell Brooks", "Kirsten Vogt"],
}
/** The sidebar's "Later today" list; each links to /today. */
export const LATER_TODAY = [
  { time: "11:00 AM", label: "Pipeline review" },
  { time: "12:00 PM", label: "Raleigh area drop" },
  { time: "04:00 PM", label: "Phoenix area drop" },
  { time: "05:00 PM", label: "First services" },
  { time: "06:30 PM", label: "Harriet Lawson callback" },
]

/** The date menu: the day first, then ranges */
export const TODAY_RANGES = [
  "Jul 16, 2026",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This month",
  "This season",
] as const
export const TODAY_RANGE_SHORT = "Jul 16"

/** The New meeting form's choices */
export const MEETING_ACCOUNTS = [
  "Boise office",
  "Raleigh office",
  "Phoenix office",
  "Cottonwood Bench",
  "Wakefield Glen",
  "Palo Verde Estates",
] as const
export const MEETING_TYPES = [
  "Meeting",
  "Area drop",
  "Ride-along",
  "Callback",
  "Review",
] as const
export const MEETING_DURATIONS = [
  "15 min",
  "30 min",
  "45 min",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "3 hours",
  "4 hours",
  "All day",
]
export const MEETING_LOCATIONS = [
  { value: "in-person", label: "In person" },
  { value: "meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "phone", label: "Phone" },
] as const
export const MEETING_PEOPLE = [
  { name: "Julia Serrano", title: "Sales Manager · Boise" },
  { name: "Darnell Brooks", title: "Team Leader · Boise" },
  { name: "Kyle Bennett", title: "Rookie Rep · Boise" },
  { name: "Rafael Lima", title: "Sales Manager · Raleigh" },
  { name: "Ayesha Malik", title: "Team Leader · Raleigh" },
  { name: "Mateo Alvarez", title: "Sales Manager · Phoenix" },
  { name: "Sam Okafor", title: "Team Leader · Phoenix" },
  { name: "Grant Lowell", title: "Partner Relations" },
  { name: "Harriet Lawson", title: "Homeowner, Cottonwood Bench" },
]
export const MEETING_DEFAULT_ATTENDEES = ["Julia Serrano", "Darnell Brooks"]
