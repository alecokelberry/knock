# The demo's world

Knock is shown running at **Vantage Marketing**, the Provo, Utah, summer-sales company that sells a pest control
partner's service agreements door to door, as a pitch for what its CRM could be. The business model follows Vantage's
public pages (college reps on 1099s, twenty-plus summer markets, pay every two weeks and a back-end check at season's
end, serviced accounts as the count). Everything in `src/data/` is invented: the people, the partner, the neighborhoods
and every number. The demo is not affiliated with or endorsed by Vantage, and the unit tests hold its numbers together.

## The business

- **A marketing company, not a pest company.** Vantage recruits college students each winter, trains them in April,
  and sends them to summer offices across the country to sell for its partner, **Ridgeline Pest**. Ridgeline's
  technicians do the service; Vantage sells, and is paid per serviced account.
- **The offices.** Tessa Calloway, the regional director who signs in, runs three of them: **Boise**, **Raleigh** and
  **Phoenix**. Each has a sales manager and a team of three reps under a team leader; rookies are in their first
  summer. Reps are 1099 contractors who live in company-arranged apartments for the season (May to August).
- **The day.** A morning meeting and training, area drops at noon, doors until dark. A rep knocks, pitches, and either
  signs the homeowner to an agreement on the tablet or leaves a price at the door and sets a callback.
- **Sold is not serviced.** A signed agreement has a three-business-day cancellation window (the FTC's cooling-off
  rule). Then Ridgeline schedules the initial service, and only once it's done does the account count toward quota and
  pay. Cancellations before that are the gap every manager watches.
- **Pay.** Reps are paid part of what they've earned every two weeks, and the rest at the end of the summer in a
  back-end check, which depends on accounts staying active. Quota and the leaderboard count serviced accounts.
- **The plans** (`products.ts`) are Ridgeline's, priced as an initial service plus a recurring charge: Quarterly Pest,
  Bi-Monthly Pest, Mosquito Season, Termite Monitoring and Rodent Exclusion, with one-time services beside them. An
  account's **contract value** is its first year: the initial service plus a year of the recurring charge.

## The screens, in this world

| Screen                          | What it shows                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard, Today, Activity Feed | The season's numbers, today's schedule (morning meeting, area drops, callbacks, first services) and what happened across the offices |
| Quick Stats                     | Sales by source (door, callback, referral), households by stage, and doors knocked by rep                                            |
| Attainment, Quota Plan          | Serviced accounts against quota by week of the season, per office and rep; next summer's quotas                                      |
| Pipeline                        | The households in play for Thursday's review: Lead → Callback → Pitched → Sold → Scheduled → Serviced                                |
| Forecast                        | The season's serviced contract value: commit, best case and all open                                                                 |
| Quotes                          | Prices left at the door, waiting on a callback                                                                                       |
| Products                        | Ridgeline's plans and one-time services                                                                                              |
| Approvals                       | Price overrides, waived initial fees, back-end advances and out-of-territory sales                                                   |
| Activities, Tasks               | Knocks, pitches, callbacks and services; callbacks, paperwork, permits and housing to do                                             |
| Contacts                        | Homeowners, from first knock to customer                                                                                             |
| Territories                     | The neighborhoods each rep works, with their doors, sales and open pipeline                                                          |
| Reports, Conversion             | The season's reports, and the funnel from doors knocked to accounts serviced                                                         |
| Settings                        | The workspace, billing for Knock's seats, the team, and integrations (Ridgeline's service file, payroll, e-sign)                     |

## One day

The demo's today is **Thursday, July 16, 2026**, in week 11 of a sixteen-week season that began Monday, May 4. Numbers
that change with time (quotes that expire, tasks that are due, the week in progress) count from it.
