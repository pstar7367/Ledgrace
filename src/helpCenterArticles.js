import { MORE_HELP_CENTER_ARTICLES } from "./helpCenterAdditionalArticles.js";

const originalArticles = [
  {
    key: "create_account_article",
    topic: "getting_started",
    title: "How do I create my account?",
    summary: "Create your Ledgrace profile and verify your email address.",
    introduction: "Your Ledgrace account keeps your financial workspace and preferences together. You will need an email address that you can open to complete verification.",
    steps: [
      "Choose Sign Up and enter your name, email address, and a password.",
      "Submit the form, then open the verification message sent to your email.",
      "Follow the verification link and return to Ledgrace to sign in.",
      "After signing in, review your profile and add your first account or transaction.",
    ],
    note: "If the message does not arrive, check your spam folder and confirm that the address was entered correctly.",
  },
  {
    key: "dashboard_overview_article",
    topic: "getting_started",
    title: "How do I read my financial overview?",
    summary: "Understand the balances, income, expenses, and activity shown on your dashboard.",
    introduction: "The dashboard summarizes the transactions currently recorded in your workspace. Its totals change as you add, edit, or remove entries.",
    steps: [
      "Open Dashboard from the workspace navigation.",
      "Review the summary figures for balance, income, expenses, and savings rate.",
      "Use the recent transactions list to check the entries included in your totals.",
      "Open the relevant workspace section to manage accounts, budgets, goals, or reports in more detail.",
    ],
    note: "If a total looks unexpected, check the transaction amount, type, date, and whether the entry is duplicated.",
  },
  {
    key: "bank_connection_article",
    topic: "accounts_connections",
    title: "How do I connect my bank account?",
    summary: "Connect an available bank account or use manual account tracking.",
    introduction: "Bank connections are only available for supported institutions and may depend on the connection options enabled for your account.",
    steps: [
      "Open Accounts and choose the option to add or connect an account.",
      "Select your institution from the available list and follow its secure authorization prompts.",
      "Review the permissions requested before approving the connection.",
      "Return to Ledgrace and check that the account appears in your account list.",
    ],
    note: "If your institution is not listed or the connection is unavailable, add the account manually and record its balance yourself.",
  },
  {
    key: "manual_account_article",
    topic: "accounts_connections",
    title: "How do I add an account manually?",
    summary: "Track an account without linking it to a bank connection.",
    introduction: "Manual accounts are useful for cash, unsupported institutions, or balances you prefer to maintain yourself.",
    steps: [
      "Open Accounts and choose Add Account.",
      "Enter a clear account name and select the account type.",
      "Enter the opening balance and save the account.",
      "Update the balance when you need your workspace to reflect a new amount.",
    ],
    note: "A manually maintained balance does not update automatically when transactions occur.",
  },
  {
    key: "add_transaction_article",
    topic: "transactions",
    title: "How do I add a transaction?",
    summary: "Record income or spending with an amount, date, and category.",
    introduction: "Transactions make up the activity behind your dashboard totals and reports. Check the transaction type before saving so it is included in the correct totals.",
    steps: [
      "Open Income to record money received, or Expenses to record spending.",
      "Choose Add and enter a recognizable description and amount.",
      "Set the transaction date and choose the closest matching category.",
      "Save the transaction, then check that it appears in the list and updated totals.",
    ],
    note: "Use the same currency and avoid entering the same transaction twice when importing or recording activity.",
  },
  {
    key: "categorize_transaction_article",
    topic: "transactions",
    title: "How do I categorize a transaction?",
    summary: "Use categories to make transaction lists and spending reports easier to understand.",
    introduction: "A consistent category makes it easier to compare where money is going over time. Choose the category that best describes the transaction rather than the payment method.",
    steps: [
      "Find the transaction in Income or Expenses.",
      "Open its edit controls and review the current category.",
      "Choose a more suitable category and save the change.",
      "Review Reports or Insights to see the transaction included in its category totals.",
    ],
    note: "If a transaction cannot be edited, confirm that it belongs to your signed-in workspace.",
  },
  {
    key: "budget_article",
    topic: "budgeting",
    title: "How do I create a budget?",
    summary: "Choose a period, set category limits, and compare spending with your plan.",
    introduction: "A budget gives you a planned limit to compare with the expenses recorded in Ledgrace. Choose a period that fits how you review your finances.",
    steps: [
      "Open Budget Planner and start a new budget.",
      "Choose the budget period and add the categories you want to track.",
      "Enter a spending limit for each category and save the budget.",
      "Return to Budget Planner as transactions are recorded to review used and remaining amounts.",
    ],
    note: "A budget is a tracking plan; it does not move money or block a transaction when a limit is reached.",
  },
  {
    key: "budget_alerts_article",
    topic: "budgeting",
    title: "How do I manage budget alerts?",
    summary: "Set category limits and control whether budget alerts are enabled.",
    introduction: "Budget alerts are tied to your budget limits and the alert preferences available in your workspace.",
    steps: [
      "Create or review your category limits in Budget Planner.",
      "Open Settings and find the Budget Alerts preference.",
      "Turn the preference on or off, then choose Save Changes.",
      "Keep transaction categories current so spending is compared with the intended limits.",
    ],
    note: "Alerts do not replace regularly reviewing your budget and recorded transactions.",
  },
  {
    key: "savings_goal_article",
    topic: "savings_goals",
    title: "How do I set a savings goal?",
    summary: "Create a target amount and track progress toward it.",
    introduction: "A savings goal records an amount you are working toward and the progress you report against that target.",
    steps: [
      "Open Savings Goals and choose to create a goal.",
      "Give the goal a name and enter its target amount and any available target date.",
      "Save the goal and review it in your goals list.",
      "Add contributions as you save so the displayed progress stays up to date.",
    ],
    note: "The progress shown depends on contributions recorded in Ledgrace; it does not independently verify a bank balance.",
  },
  {
    key: "goal_contribution_article",
    topic: "savings_goals",
    title: "How do I update savings goal progress?",
    summary: "Record a contribution and compare your saved amount with the target.",
    introduction: "Keep goal progress current by recording contributions when you set money aside.",
    steps: [
      "Open Savings Goals and select the goal you want to update.",
      "Choose its contribution or progress action.",
      "Enter the amount to add and confirm the entry.",
      "Check the updated saved amount and remaining amount against the target.",
    ],
    note: "If a contribution was entered incorrectly, edit or remove that entry before recording it again.",
  },
  {
    key: "recurring_bill_article",
    topic: "bills_subscriptions",
    title: "How do I track a recurring bill?",
    summary: "Record a bill, its frequency, and its next due date.",
    introduction: "Bill records help you review upcoming obligations and recurring subscriptions in one place.",
    steps: [
      "Open Bills & Subscriptions and choose Add Bill.",
      "Enter the bill name and amount, then select its frequency.",
      "Set the next due date and any other available reminder details.",
      "Save the bill and confirm it appears in your upcoming bill list.",
    ],
    note: "Adding a bill records it in Ledgrace; it does not schedule a payment with your bank or provider.",
  },
  {
    key: "bill_reminder_article",
    topic: "bills_subscriptions",
    title: "How do I review upcoming bill dates?",
    summary: "Check upcoming due dates and keep bill schedules accurate.",
    introduction: "The upcoming bills list helps you plan around due dates entered for each bill.",
    steps: [
      "Open Bills & Subscriptions and review the upcoming items.",
      "Check each bill's next due date, amount, and recurrence.",
      "Edit a bill if its schedule or amount has changed.",
      "Use Financial Calendar to review scheduled events alongside other dates.",
    ],
    note: "The displayed schedule relies on the details saved for each bill, so update it when a provider changes a due date.",
  },
  {
    key: "reports_article",
    topic: "reports_insights",
    title: "How do I understand my financial reports?",
    summary: "Review income, expenses, and savings using the activity recorded in your workspace.",
    introduction: "Reports summarize the records available in your Ledgrace workspace. Their accuracy depends on keeping transactions and categories up to date.",
    steps: [
      "Open Reports and choose the report or period you want to review.",
      "Compare the income, expense, and savings figures shown for that period.",
      "Review category details to understand what contributes to each total.",
      "Correct missing, duplicated, or miscategorized transactions in their source lists.",
    ],
    note: "A report only includes activity recorded in Ledgrace and should not be treated as a bank statement.",
  },
  {
    key: "export_report_article",
    topic: "reports_insights",
    title: "How do I export my financial data?",
    summary: "Choose an available export format and download a copy of your records.",
    introduction: "Exports create a local copy of data included in the selected report or workspace export. Review the file before sharing it because it may contain sensitive financial information.",
    steps: [
      "Open Reports and select the report you want to keep, or use Settings for a workspace data export.",
      "Choose an available file format, such as CSV or JSON, where offered.",
      "Check the export options, including whether attachments are included.",
      "Start the download and store the resulting file somewhere private.",
    ],
    note: "Only export or share financial data with people and services you trust.",
  },
  {
    key: "update_preferences_article",
    topic: "account_settings",
    title: "How do I change my app preferences?",
    summary: "Set appearance, currency, language, and other workspace preferences.",
    introduction: "Settings control how Ledgrace presents information and which workspace defaults are used.",
    steps: [
      "Open Settings and choose the section containing the preference you want to change.",
      "Update the control, such as theme, currency, language, date format, or display option.",
      "Review your selections and choose Save Changes at the bottom of the page.",
      "Return to the relevant workspace page to confirm the saved preference is reflected there.",
    ],
    note: "Some preferences affect presentation only; they do not change the underlying financial records.",
  },
  {
    key: "secure_account_article",
    topic: "account_settings",
    title: "How do I protect my account?",
    summary: "Use a strong password and review sign-in activity regularly.",
    introduction: "Good account habits help protect access to your financial workspace.",
    steps: [
      "Use a unique password that you do not reuse on other services.",
      "Open Settings and change your password if you believe it may have been exposed.",
      "Review Login Activity for sign-ins you do not recognize.",
      "Sign out of shared devices and contact support if suspicious activity continues.",
    ],
    note: "Never send your password or verification codes to someone claiming to be support.",
  },
];

const extendedSections = {
  create_account_article: [{ heading: "Troubleshooting verification", paragraphs: ["Email verification is a one-time account check. If the message is delayed, search your inbox for Ledgrace and check spam or promotions folders before requesting another message. A typo in the address means the message cannot reach you, so verify the address carefully.", "Verification links can expire or be used only once. If a link reports an error, return to the sign-in flow and request a fresh message rather than forwarding the old link. Keep your password private throughout the process; support will never need it to verify your account."] }],
  dashboard_overview_article: [{ heading: "Understand what the totals include", paragraphs: ["Dashboard totals summarize information recorded in your workspace, not necessarily every account or transaction you hold. If an account has not been connected or entered, its balance and activity cannot contribute to the overview.", "Use the recent activity list to trace individual amounts and confirm their type. A balance total can be understood only in the context of the accounts and transactions included, so compare it with a statement for the same date when accuracy matters."] }],
  bank_connection_article: [{ heading: "Review access and keep the connection current", paragraphs: ["A connection may ask the financial institution to authorize access to account details or transaction history. Read the institution's permission screen and approve only the access you expect. The institution handles the authentication step; do not send credentials to another person.", "Some providers ask you to reconnect when authorization expires or security settings change. If activity stops updating, check the connection status and provider notices first. Reconnecting should not require adding a duplicate account; verify the existing account before starting a new connection."] }],
  manual_account_article: [{ heading: "Maintain a manual account", paragraphs: ["Manual tracking depends on you to keep the balance and activity current. Choose a statement or other reliable source as the opening balance, and note the date that balance represents so it is not confused with a live bank figure.", "When updating a manual account, use the account controls consistently and avoid recording the same change both as a balance adjustment and as a transaction unless the product workflow specifies that relationship. Reconcile periodically against a trusted statement."] }],
  add_transaction_article: [{ heading: "Enter complete transaction details", paragraphs: ["A clear description and correct date make an entry easier to find later. Select income or expense based on the direction of the money, then use a category that represents the purpose of the activity rather than the account or payment method.", "Before saving, compare the amount with a receipt or statement and check whether the entry already exists. If you track several accounts, make sure the transaction is associated with the intended account when that control is available. A quick review prevents many reporting discrepancies."] }],
  categorize_transaction_article: [{ heading: "Keep categories useful over time", paragraphs: ["Categories help reports group related activity, so consistency matters more than using a long list of labels. If two categories mean nearly the same thing, choose one convention and apply it to future entries; update past records when a comparison requires it.", "A category should describe why the transaction happened. For example, a purchase made with a card belongs with the purchased item or service, not with the card itself. This distinction helps category totals answer useful questions about spending."] }],
  budget_article: [{ heading: "Review the plan against actual activity", paragraphs: ["After setting limits, return during the budget period and compare planned amounts with expenses recorded so far. An empty or low total can mean that spending has not been entered yet, rather than that the category has no real-world expenses.", "At the end of the period, review categories that differ from the plan and decide whether the cause was a one-time event, missing records, or a limit that no longer fits. Adjust future plans based on that explanation instead of changing history to make the figures appear closer."] }],
  budget_alerts_article: [{ heading: "Use alerts alongside regular reviews", paragraphs: ["An alert is useful only when budget limits and transaction categories reflect your actual plan. Check that expenses are assigned to the intended category and that the budget period is correct before relying on an alert to highlight a change.", "Notification delivery can also depend on account preferences and device permissions. Keep reviewing Budget Planner directly, especially when a due date or large expense is approaching. Alerts support awareness but do not block purchases or replace your own financial decisions."] }],
  savings_goal_article: [{ heading: "Make a goal measurable", paragraphs: ["A specific goal name makes it clear what the target is for. Include the total expected cost and a target date if one is available, then consider whether the contribution pace fits your income and other obligations.", "If your target is far away, create a nearer milestone to make progress easier to review. A milestone is a planning aid; make sure it does not count money already assigned to another goal. Revisit the target if prices, deadlines, or your priorities change."] }],
  goal_contribution_article: [{ heading: "Keep the tracker aligned with real savings", paragraphs: ["Record contributions when funds have actually been set aside, and avoid entering planned future contributions as completed savings. The goal tracker is a record of what you report, not a connection that independently confirms the money is present.", "If an amount was entered incorrectly, correct the original contribution where possible before adding a replacement. Compare the goal total with the relevant account periodically, particularly after withdrawals or transfers, so the progress indicator remains meaningful."] }],
  recurring_bill_article: [{ heading: "Understand what a bill record does", paragraphs: ["A scheduled bill helps you remember an expected amount and date. It is a planning record and does not authorize a payment, contact the provider, or guarantee that the final amount will be identical to the estimate.", "For each recurring item, keep the frequency and next due date accurate. When a provider changes the schedule, update the record so future views do not continue to show an outdated date. Record the actual expense separately if your workflow requires transaction tracking."] }],
  bill_reminder_article: [{ heading: "Review changes to the schedule", paragraphs: ["A due date in Ledgrace reflects the date saved for that bill. Providers can move dates for weekends, holidays, plan changes, or account-specific reasons, so compare the saved schedule with the current provider statement.", "After a payment, check whether the next cycle has been advanced correctly. If the bill is no longer active, edit or remove its schedule so the upcoming total does not include an obligation that has ended."] }],
  reports_article: [{ heading: "Check report coverage before interpreting it", paragraphs: ["A report can summarize only the records available for its selected period. Missing accounts, incomplete imports, and uncategorized activity can all change the apparent picture even if the report itself is functioning as expected.", "Use category details to trace a surprising total to its source entries. Correct records in the relevant account or transaction list, then return to the report. This preserves a clear source of truth and helps future reports use the same corrected data."] }],
  export_report_article: [{ heading: "Validate an export before using it", paragraphs: ["An export is a point-in-time copy of the records selected by the report or export workflow. Confirm its period, fields, and number of rows before using it for analysis or sharing it with another service.", "Spreadsheet software may reinterpret dates, long identifiers, and decimal values when opening CSV files. Compare a few rows with the application and preserve an unchanged source copy if the exported file will be used for important recordkeeping."] }],
  update_preferences_article: [{ heading: "Preview and verify saved preferences", paragraphs: ["Some preferences update the interface immediately as a preview, while Save Changes commits the selection to your account. Look for the save confirmation and revisit the setting after navigating away to ensure the committed value remains selected.", "A preference such as currency or date format changes presentation and defaults. It does not alter the source currency or original date stored on each financial record. Review a representative page after saving to confirm that the change appears where you expect."] }],
  secure_account_article: [{ heading: "Respond to suspicious activity", paragraphs: ["If you see a sign-in you do not recognize, change your password from a trusted device and review the security options available in your account. Also check your email account, since control of that inbox can affect password recovery.", "Contact support through the published support channel if access remains unusual. Include the time and type of activity you noticed, but never include your password, full payment details, or one-time authentication codes in a message."] }],
};

const furtherSections = {
  create_account_article: [{ heading: "Finish setting up your profile", paragraphs: ["After your first sign-in, review your name and account preferences. A correct language and time zone make messages and date displays easier to interpret, while a preferred currency helps present totals in a familiar way.", "You can add financial records gradually. Start with information you can verify, then return to add more detail. Keeping an accurate workspace is more useful than entering a large amount of uncertain information all at once."] }],
  dashboard_overview_article: [{ heading: "Use the overview to decide what to review", paragraphs: ["The dashboard is a starting point for questions, not a substitute for the detail behind each figure. If expenses rose, open the transaction list and identify the entries contributing to that movement before deciding whether the change is recurring.", "You can move between workspace sections to inspect the source of a number. After correcting an entry, revisit the overview and confirm that its summary changed as expected. This creates a useful check that the correction was saved."] }],
  bank_connection_article: [{ heading: "When to use manual tracking instead", paragraphs: ["A manual account is a practical alternative if the institution is unsupported, temporarily unavailable, or you prefer not to establish a connection. You can still record balances and transactions, but you must maintain them yourself.", "Before switching methods, review the existing history and avoid importing a period that is already represented by manual entries. Keeping one clear source for each transaction period makes account totals easier to reconcile."] }],
  manual_account_article: [{ heading: "Reconcile the balance over time", paragraphs: ["Choose a regular date to compare the saved account balance with a statement. If the figures differ, review transactions since the last confirmed balance and identify missing or duplicated activity before changing the balance.", "A short note about the last reconciliation date can help you remember what the displayed amount represents. This is especially useful for cash or savings accounts that do not have a connected transaction feed."] }],
  add_transaction_article: [{ heading: "What to do when details are uncertain", paragraphs: ["If an amount or date is still pending, wait for the final information when possible. If you need to record an estimate for planning, clearly distinguish it from a confirmed transaction so it is not mistaken for posted activity.", "For recurring activity, record each real transaction according to your normal process rather than assuming a scheduled bill automatically creates an expense. This keeps transaction history grounded in actual payments."] }],
  categorize_transaction_article: [{ heading: "Correct categories without losing context", paragraphs: ["If a category changes, consider whether older transactions should use the same category for a fair comparison. Reports spanning multiple periods can otherwise combine two different classification approaches.", "When the best category is unclear, use the closest consistent option and revisit it during a regular review. A stable classification is more useful for trends than switching labels frequently for similar purchases."] }],
  budget_article: [{ heading: "Use the budget as a planning tool", paragraphs: ["A budget describes intended limits; it does not reserve funds or prevent a transaction. Keep enough flexibility for essential costs that vary, and check whether a limit represents a monthly amount or another selected period.", "If you share financial decisions with someone else, agree on what each category includes before setting a limit. Clear definitions reduce disagreements about whether a purchase belongs in the plan."] }],
  budget_alerts_article: [{ heading: "Review notification delivery", paragraphs: ["A saved alert preference is one part of delivery. Browser or device permissions may separately block notifications, and not every type of alert is delivered through every channel.", "If you expect a notice, review the relevant preference and the device permission before relying on it. For important payment dates, keep a separate reminder until you have confirmed that the alert workflow suits your needs."] }],
  savings_goal_article: [{ heading: "Separate the goal from the account", paragraphs: ["A goal is a plan for money you intend to save; it may not be a separate bank account. Keep the actual funds in an account you control and use the goal tracker to record the amount allocated to that purpose.", "If the goal is for an emergency reserve, decide what conditions justify using it. A clear purpose and target make it easier to judge whether progress is adequate when other expenses compete for the same funds."] }],
  goal_contribution_article: [{ heading: "Handle withdrawals and corrections", paragraphs: ["If you use some of the money that was set aside, the tracker may need a corresponding correction so its saved amount does not overstate available funds. Use the goal controls to adjust the history when supported.", "A contribution should represent an amount allocated once. Transfers between accounts that contain the same savings should not be counted as new savings unless the money was newly set aside."] }],
  recurring_bill_article: [{ heading: "Avoid double-counting scheduled bills", paragraphs: ["A bill schedule and an expense transaction may describe the same payment in different parts of the workspace. Follow the product's payment-recording flow and check reports to avoid including the same real expense twice.", "If the bill is variable, treat its scheduled amount as an expectation and update it after the final amount is known. A useful schedule distinguishes planned obligations from completed spending."] }],
  bill_reminder_article: [{ heading: "Plan around due dates", paragraphs: ["Review upcoming items early enough to act before the due date. If a payment method, provider, or amount changes, update the record as soon as the change is confirmed so the calendar remains dependable.", "Use due-date views as a planning aid, not proof that a payment has been scheduled. Confirm a payment directly with your provider or bank when completion matters."] }],
  reports_article: [{ heading: "Use reports for comparison, not prediction", paragraphs: ["Historical reports describe recorded activity; they cannot guarantee that the next period will follow the same pattern. Consider known upcoming bills, changes in income, and unusual events when planning from past results.", "When sharing a report, explain the date range and whether all accounts are included. A clear scope helps another reader understand what the totals do and do not represent."] }],
  export_report_article: [{ heading: "Protect sensitive exports", paragraphs: ["Financial exports can include more detail than a screenshot or summary page. Check the destination before uploading a file and remove fields that are not needed for the task when your export options allow it.", "If you send a file to an accountant or another trusted person, use a secure transfer method and confirm that the recipient needs the full dataset. Delete temporary or duplicate copies when they are no longer required."] }],
  update_preferences_article: [{ heading: "Understand immediate previews", paragraphs: ["Some controls may preview a change before you save it. If you leave Settings without saving, the committed preference remains the previous selection and the preview can be restored when the page closes.", "After saving, check the affected page rather than relying only on the control state. Currency should appear in monetary totals, language in translated labels, and appearance choices across the workspace."] }],
  secure_account_article: [{ heading: "Recognize unsafe requests", paragraphs: ["A legitimate support conversation should not require you to disclose your password, verification code, PIN, or complete card details. Treat unexpected requests for these secrets as suspicious, even if a message uses a familiar logo.", "Use the contact information shown in the application or on the official service site rather than replying to an unsolicited message. This helps ensure that you are communicating with the intended support team."] }],
};

Object.entries(furtherSections).forEach(([key, sections]) => {
  extendedSections[key] = [...extendedSections[key], ...sections];
});

export const HELP_CENTER_ARTICLES = [...originalArticles, ...MORE_HELP_CENTER_ARTICLES].map((article) => ({
  ...article,
  sections: article.sections || extendedSections[article.key] || [],
}));

export const HELP_CENTER_ARTICLE_COUNTS = HELP_CENTER_ARTICLES.reduce((counts, article) => {
  counts[article.topic] = (counts[article.topic] || 0) + 1;
  return counts;
}, {});

export function localizeHelpCenterArticle(article, translateText) {
  const text = (field, fallback) => {
    const key = `${article.key}.${field}`;
    const translated = translateText(key);
    return translated === key ? fallback : translated;
  };

  return {
    ...article,
    title: text("title", article.title),
    summary: text("summary", article.summary),
    introduction: text("introduction", article.introduction),
    steps: article.steps.map((step, index) => text(`step.${index}`, step)),
    note: text("note", article.note),
    sections: article.sections.map((section, sectionIndex) => ({
      heading: text(`section.${sectionIndex}.heading`, section.heading),
      paragraphs: section.paragraphs.map((paragraph, paragraphIndex) => text(`section.${sectionIndex}.paragraph.${paragraphIndex}`, paragraph)),
    })),
  };
}

export function getArticleReadingTime(article, translateText = (key) => key, language = "English") {
  const localized = localizeHelpCenterArticle(article, translateText);
  const text = [
    localized.title,
    localized.summary,
    localized.introduction,
    ...localized.steps,
    localized.note,
    ...localized.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ].filter(Boolean).join(" ");
  if (["Chinese", "Japanese"].includes(language)) {
    const characters = Array.from(text.replace(/\s/gu, "")).length;
    return Math.max(1, Math.ceil(characters / 500));
  }
  const words = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
  return Math.max(1, Math.ceil(words.length / 200));
}
