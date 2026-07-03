import type { AppNode, JsonObject } from "@/schemas/app-spec";
import type { BuilderDocumentState, BuilderPage } from "./types";
import { normalizeAppNode } from "./normalization";

const PROJECT_ID = "northstar-capital-os";

function node(
  id: string,
  type: string,
  props: JsonObject = {},
  style: JsonObject = {},
  children: AppNode[] = [],
): AppNode {
  return {
    id,
    type,
    props,
    style,
    bindings: {},
    events: {},
    children,
  };
}

function text(
  id: string,
  value: string,
  style: JsonObject = {},
  level: "body" | "heading" = "body",
): AppNode {
  return node(id, "Text", { text: value, level }, style);
}

function button(
  id: string,
  value: string,
  variant: "primary" | "default" | "text" = "primary",
  style: JsonObject = {},
): AppNode {
  return node(id, "Button", { text: value, variant, size: "large" }, style);
}

function section(
  id: string,
  style: JsonObject,
  children: AppNode[],
): AppNode {
  return node(
    id,
    "Section",
    {},
    { background: "transparent", padding: "0", ...style },
    children,
  );
}

function metricCard(
  id: string,
  label: string,
  value: string,
  detail: string,
): AppNode {
  return section(
    id,
    {
      background: "#ffffff",
      borderColor: "#dbe7ef",
      borderStyle: "solid",
      borderWidth: "1px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "20px",
      radius: "14px",
    },
    [
      text(`${id}-label`, label, {
        color: "#5d7182",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: "18px",
      }),
      text(`${id}-value`, value, {
        color: "#122436",
        fontSize: "30px",
        fontWeight: 800,
        lineHeight: "36px",
      }),
      text(`${id}-detail`, detail, {
        color: "#6d7f8e",
        fontSize: "13px",
        lineHeight: "20px",
      }),
    ],
  );
}

function featureCard(
  id: string,
  eyebrow: string,
  title: string,
  body: string,
): AppNode {
  return section(
    id,
    {
      background: "#ffffff",
      borderColor: "#dbe7ef",
      borderStyle: "solid",
      borderWidth: "1px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minHeight: "220px",
      padding: "24px",
      radius: "16px",
    },
    [
      section(
        `${id}-mark`,
        {
          background: "#0d8fa6",
          height: "6px",
          padding: "0",
          radius: "999px",
          width: "52px",
        },
        [],
      ),
      text(`${id}-eyebrow`, eyebrow, {
        color: "#61798a",
        fontSize: "12px",
        fontWeight: 800,
        lineHeight: "18px",
      }),
      text(`${id}-title`, title, {
        color: "#122436",
        fontSize: "22px",
        fontWeight: 800,
        lineHeight: "28px",
      }),
      text(`${id}-body`, body, {
        color: "#607282",
        fontSize: "14px",
        lineHeight: "23px",
      }),
    ],
  );
}

function pageFrame(id: string, children: AppNode[]): AppNode {
  return node(
    id,
    "Frame",
    {},
    {
      background: "#eef5f8",
      minHeight: "100vh",
      overflowX: "hidden",
      overflowY: "auto",
      padding: "0",
    },
    children,
  );
}

function pageChrome(id: string, children: AppNode[]): AppNode {
  return section(
    id,
    {
      background: "#eef5f8",
      display: "flex",
      flexDirection: "column",
      gap: "0",
      margin: "0 auto",
      maxWidth: "1180px",
      minHeight: "100vh",
      padding: "28px 28px 56px",
      width: "100%",
    },
    children,
  );
}

const sharedNav = (id: string) =>
  section(
    id,
    {
      alignItems: "center",
      background: "#ffffff",
      borderColor: "#d6e3ea",
      borderStyle: "solid",
      borderWidth: "1px",
      display: "flex",
      gap: "18px",
      justifyContent: "space-between",
      marginBottom: "28px",
      padding: "12px 16px",
      radius: "18px",
    },
    [
      section(
        `${id}-brand`,
        {
          alignItems: "center",
          display: "flex",
          gap: "12px",
          padding: "0",
        },
        [
          section(
            `${id}-brand-mark`,
            {
              background: "#0d8fa6",
              height: "34px",
              padding: "0",
              radius: "10px",
              width: "34px",
            },
            [],
          ),
          text(`${id}-brand-name`, "Northstar Capital OS", {
            color: "#122436",
            fontSize: "16px",
            fontWeight: 800,
            lineHeight: "20px",
          }),
        ],
      ),
      section(
        `${id}-links`,
        {
          alignItems: "center",
          display: "flex",
          gap: "16px",
          padding: "0",
        },
        [
          text(`${id}-link-1`, "Platform", {
            color: "#536879",
            fontSize: "13px",
            fontWeight: 700,
          }),
          text(`${id}-link-2`, "Portfolio", {
            color: "#536879",
            fontSize: "13px",
            fontWeight: 700,
          }),
          text(`${id}-link-3`, "Pricing", {
            color: "#536879",
            fontSize: "13px",
            fontWeight: 700,
          }),
          button(`${id}-cta`, "Request access", "primary", {
            background: "#122436",
            borderColor: "#122436",
            borderRadius: "10px",
            fontWeight: 800,
          }),
        ],
      ),
    ],
  );

export const homeRootNode: AppNode = pageFrame("home-root", [
  pageChrome("home-shell", [
    sharedNav("home-nav"),
    section(
      "home-hero",
      {
        background: "#0f2737",
        display: "flex",
        gap: "30px",
        padding: "44px",
        radius: "26px",
      },
      [
        section(
          "home-hero-copy",
          {
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            minWidth: "520px",
            padding: "0",
          },
          [
            text("home-eyebrow", "CAPITAL OPERATIONS PLATFORM", {
              color: "#8ee5f1",
              fontSize: "12px",
              fontWeight: 900,
              lineHeight: "18px",
            }),
            text(
              "home-title",
              "Run investor reporting, portfolio risk, and deal decisions from one command layer.",
              {
                color: "#ffffff",
                fontSize: "44px",
                fontWeight: 900,
                lineHeight: "52px",
                margin: "0",
              },
              "heading",
            ),
            text(
              "home-subtitle",
              "Northstar gives private market teams a calm workspace for live fund metrics, board-ready reporting, and every operating workflow between intake and exit.",
              {
                color: "#c8d7df",
                fontSize: "16px",
                lineHeight: "27px",
                maxWidth: "560px",
              },
            ),
            section(
              "home-actions",
              {
                alignItems: "center",
                display: "flex",
                gap: "12px",
                padding: "0",
              },
              [
                button("home-primary-action", "Open command center", "primary", {
                  background: "#13a7bd",
                  borderColor: "#13a7bd",
                  borderRadius: "12px",
                  fontWeight: 900,
                }),
                button("home-secondary-action", "View sample report", "default", {
                  background: "#ffffff",
                  borderColor: "#ffffff",
                  borderRadius: "12px",
                  color: "#122436",
                  fontWeight: 900,
                }),
              ],
            ),
          ],
        ),
        section(
          "home-hero-panel",
          {
            background: "#f7fbfd",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minWidth: "300px",
            padding: "22px",
            radius: "22px",
          },
          [
            text("home-panel-label", "Live fund pulse", {
              color: "#5a6f80",
              fontSize: "13px",
              fontWeight: 800,
            }),
            metricCard("home-metric-aum", "AUM under command", "$4.8B", "+18.4% trailing 12 months"),
            metricCard("home-metric-risk", "Portfolio risk alerts", "14", "6 require partner review"),
            metricCard("home-metric-cycle", "Report cycle", "3.2 days", "Down from 9.5 days"),
          ],
        ),
      ],
    ),
    section(
      "home-feature-grid",
      {
        display: "flex",
        gap: "18px",
        marginTop: "28px",
        padding: "0",
      },
      [
        featureCard(
          "home-feature-1",
          "01 / DATA ROOM",
          "One source of investor truth",
          "Keep capital calls, distributions, ownership records, and quarterly memos connected to the same operating graph.",
        ),
        featureCard(
          "home-feature-2",
          "02 / WORKFLOW",
          "Approvals without spreadsheet drift",
          "Route IC notes, legal checks, and finance approvals through auditable paths your team can edit in the builder.",
        ),
        featureCard(
          "home-feature-3",
          "03 / REPORTING",
          "Board-ready by default",
          "Every page is composed from reusable sections, so your report library stays consistent as the business changes.",
        ),
      ],
    ),
  ]),
]);

export const dashboardRootNode: AppNode = pageFrame("dashboard-root", [
  pageChrome("dashboard-shell", [
    sharedNav("dashboard-nav"),
    section(
      "dashboard-header",
      {
        alignItems: "flex-end",
        display: "flex",
        gap: "24px",
        justifyContent: "space-between",
        padding: "0",
      },
      [
        section(
          "dashboard-title-group",
          {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "0",
            minWidth: "620px",
          },
          [
            text("dashboard-kicker", "PORTFOLIO COMMAND CENTER", {
              color: "#0d8fa6",
              fontSize: "12px",
              fontWeight: 900,
            }),
            text("dashboard-title", "Morning partner view", {
              color: "#122436",
              fontSize: "38px",
              fontWeight: 900,
              lineHeight: "46px",
              margin: "0",
            }, "heading"),
            text("dashboard-summary", "A focused operational surface for risk, velocity, liquidity, and follow-up ownership across the portfolio.", {
              color: "#61798a",
              fontSize: "15px",
              lineHeight: "24px",
            }),
          ],
        ),
        button("dashboard-export", "Export memo", "primary", {
          background: "#122436",
          borderColor: "#122436",
          borderRadius: "12px",
          fontWeight: 900,
        }),
      ],
    ),
    section(
      "dashboard-metrics",
      {
        display: "flex",
        gap: "16px",
        marginTop: "24px",
        padding: "0",
      },
      [
        metricCard("dashboard-metric-1", "Net IRR", "21.7%", "+2.1 pts quarter over quarter"),
        metricCard("dashboard-metric-2", "Dry powder", "$680M", "42% reserved for follow-ons"),
        metricCard("dashboard-metric-3", "Active reviews", "31", "9 need a decision this week"),
        metricCard("dashboard-metric-4", "LP questions", "8", "All assigned with owners"),
      ],
    ),
    section(
      "dashboard-main",
      {
        display: "flex",
        gap: "18px",
        marginTop: "20px",
        padding: "0",
      },
      [
        section(
          "dashboard-table-card",
          {
            background: "#ffffff",
            borderColor: "#dbe7ef",
            borderStyle: "solid",
            borderWidth: "1px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minWidth: "620px",
            padding: "22px",
            radius: "18px",
          },
          [
            text("dashboard-table-title", "Portfolio watchlist", {
              color: "#122436",
              fontSize: "20px",
              fontWeight: 900,
            }),
            node(
              "dashboard-watchlist-table",
              "Table",
              {
                columns: [
                  { title: "Company", dataIndex: "company", key: "company" },
                  { title: "Signal", dataIndex: "signal", key: "signal" },
                  { title: "Owner", dataIndex: "owner", key: "owner" },
                ],
                dataSource: [
                  { key: "1", company: "Aperture Labs", signal: "Cash runway below 9 months", owner: "Mira" },
                  { key: "2", company: "Lattice Grid", signal: "Enterprise churn spike", owner: "Jon" },
                  { key: "3", company: "Cobalt Health", signal: "Series C diligence", owner: "Rhea" },
                ],
                pagination: false,
                size: "middle",
              },
              {},
            ),
          ],
        ),
        section(
          "dashboard-action-card",
          {
            background: "#122436",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minWidth: "300px",
            padding: "24px",
            radius: "18px",
          },
          [
            text("dashboard-action-label", "TODAY", {
              color: "#8ee5f1",
              fontSize: "12px",
              fontWeight: 900,
            }),
            text("dashboard-action-title", "Three decisions need partner attention before 4 PM.", {
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: "32px",
            }),
            text("dashboard-action-copy", "The builder can turn this into workflow-driven routing later. For now every block remains manually editable.", {
              color: "#c8d7df",
              fontSize: "14px",
              lineHeight: "23px",
            }),
            button("dashboard-action-button", "Review queue", "primary", {
              background: "#13a7bd",
              borderColor: "#13a7bd",
              borderRadius: "12px",
              fontWeight: 900,
              marginTop: "8px",
            }),
          ],
        ),
      ],
    ),
  ]),
]);

export const pricingRootNode: AppNode = pageFrame("pricing-root", [
  pageChrome("pricing-shell", [
    sharedNav("pricing-nav"),
    section(
      "pricing-intro",
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px 0 30px",
        textAlign: "center",
      },
      [
        text("pricing-kicker", "PRIVATE MARKET OPERATIONS", {
          color: "#0d8fa6",
          fontSize: "12px",
          fontWeight: 900,
        }),
        text("pricing-title", "Start with the operating layer your fund can actually maintain.", {
          color: "#122436",
          fontSize: "38px",
          fontWeight: 900,
          lineHeight: "46px",
          margin: "0",
          maxWidth: "760px",
          textAlign: "center",
        }, "heading"),
        text("pricing-copy", "Each plan is represented with editable cards, buttons, and text so a user can rebuild or reshape this page by hand in the current builder.", {
          color: "#61798a",
          fontSize: "15px",
          lineHeight: "25px",
          maxWidth: "700px",
          textAlign: "center",
        }),
      ],
    ),
    section(
      "pricing-cards",
      {
        display: "flex",
        gap: "18px",
        padding: "0",
      },
      [
        featureCard("pricing-card-1", "BASE", "Fund Core", "Investor updates, portfolio snapshots, reusable pages, and approval-ready reporting blocks."),
        section(
          "pricing-card-2",
          {
            background: "#122436",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: "280px",
            padding: "26px",
            radius: "18px",
          },
          [
            text("pricing-card-2-eyebrow", "MOST SELECTED", {
              color: "#8ee5f1",
              fontSize: "12px",
              fontWeight: 900,
            }),
            text("pricing-card-2-title", "Capital Command", {
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: "32px",
            }),
            text("pricing-card-2-body", "Workflow routing, portfolio alerts, board memo exports, and multi-page operating dashboards.", {
              color: "#c8d7df",
              fontSize: "14px",
              lineHeight: "23px",
            }),
            text("pricing-card-2-price", "$8,400 / month", {
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 900,
              marginTop: "10px",
            }),
            button("pricing-card-2-button", "Start pilot", "primary", {
              background: "#13a7bd",
              borderColor: "#13a7bd",
              borderRadius: "12px",
              fontWeight: 900,
            }),
          ],
        ),
        featureCard("pricing-card-3", "ENTERPRISE", "Institution Suite", "Dedicated controls for permissions, data governance, portfolio taxonomy, and internal operating reviews."),
      ],
    ),
    section(
      "pricing-proof",
      {
        background: "#ffffff",
        borderColor: "#dbe7ef",
        borderStyle: "solid",
        borderWidth: "1px",
        display: "flex",
        gap: "24px",
        marginTop: "24px",
        padding: "24px",
        radius: "18px",
      },
      [
        metricCard("pricing-proof-1", "Implementation", "14 days", "From data map to first team review"),
        metricCard("pricing-proof-2", "Report reuse", "74%", "Blocks reused across LP and board pages"),
        metricCard("pricing-proof-3", "Manual edits", "100%", "Every visible block remains builder editable"),
      ],
    ),
  ]),
]);

const pages: BuilderPage[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    canvas: { x: 0, y: 0 },
  },
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    canvas: { x: 1056, y: 0 },
  },
  {
    id: "pricing",
    name: "Pricing",
    path: "/pricing",
    canvas: { x: 2112, y: 0 },
  },
];

const rootNodesByPageId: Record<string, AppNode> = {
  home: homeRootNode,
  dashboard: dashboardRootNode,
  pricing: pricingRootNode,
};

const normalizedNodes = pages.reduce<Record<string, ReturnType<typeof normalizeAppNode>[string]>>(
  (nodes, page) => normalizeAppNode(rootNodesByPageId[page.id], null, nodes),
  {},
);

export const initialRootNode = homeRootNode;

export const initialBuilderDocumentState: BuilderDocumentState = {
  appId: PROJECT_ID,
  activePageId: "home",
  pagesById: Object.fromEntries(pages.map((page) => [page.id, page])),
  pageOrder: pages.map((page) => page.id),
  rootNodeIdsByPage: Object.fromEntries(
    pages.map((page) => [page.id, rootNodesByPageId[page.id].id]),
  ),
  nodes: normalizedNodes,
  clipboard: null,
  dragSession: null,
  dropIndicator: null,
};
