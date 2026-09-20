// Public, authored examples only. No inference, crawling or client data.
export const offers = {
  qa: {
    title: 'Find the weak answers before your users do.',
    name: 'Chatbot QA review',
    problem: 'For teams with a chatbot or a set of model responses that need a structured second look.',
    output: ['An agreed evaluation rubric', 'A response-by-response scorecard with evidence', 'Prioritised findings and practical next steps'],
    inputs: 'Your intended use case, reference answers or policy, and sanitised responses you have permission to share.',
    boundary: 'Human-led evaluation, not model training, a security certification or a guarantee that every failure will be found. Implementation and retesting are separate scopes.',
    scope: ['Small response sample', 'Comparison of two response sets', 'Repeat review after agreed changes'],
    gig: 'https://www.fiverr.com/dhairya_sharma5/evaluate-your-ai-chatbot-and-deliver-a-detailed-qa-scorecard',
    proof: 'https://github.com/DhairyaDevelops/llm-evaluation-lab/blob/main/reports/demo/report.md',
    proofLabel: 'Inspect the evaluation report'
  },
  web: {
    title: 'Turn your offer into a working landing page.',
    name: 'Responsive landing page',
    problem: 'For founders and small teams who need one clear place to explain a product or service.',
    output: ['A scoped, responsive React page', 'Agreed navigation and enquiry interactions', 'Source files, setup instructions and handover notes'],
    inputs: 'Approved copy, images you can use, brand guidance and the one action visitors should take.',
    boundary: 'A landing page is not a full application. Accounts, payments, custom backends, paid hosting and ongoing maintenance need separate agreement. No traffic or conversion guarantee.',
    scope: ['One new landing page', 'Improve an existing page', 'A focused interface prototype'],
    gig: 'https://www.fiverr.com/dhairya_sharma5/build-a-responsive-react-landing-page-for-your-startup',
    proof: 'https://dhairyadevelops.github.io/react-landing-page/',
    proofLabel: 'Try the working website'
  },
  seo: {
    title: 'Know which website fixes deserve attention first.',
    name: 'Technical SEO audit',
    problem: 'For site owners who need an evidence-backed issue list rather than an unexplained health score.',
    output: ['An issue sheet with affected pages and evidence', 'Priority, recommended action and verification steps', 'A readable summary to hand to your developer'],
    inputs: 'Public URLs you own or are authorised to have reviewed, plus your site goals and known issues.',
    boundary: 'Audit and recommendations only. Fixes, paid tools, backlinks and ongoing SEO are separate. No ranking, indexing or traffic guarantee; no intrusive security testing.',
    scope: ['A small set of public pages', 'One priority site journey', 'Recheck previously reported issues'],
    gig: 'https://www.fiverr.com/dhairya_sharma5/audit-your-website-technical-seo-and-prioritize-the-fixes',
    proof: '#sample-seo',
    proofLabel: 'Explore the illustrative issue sheet'
  }
};

export const qaCases = {
  refund: {
    label: 'Refund policy',
    prompt: 'I bought this 45 days ago. Can I get a refund?',
    reference: 'Fictional policy: refunds are available within 30 days. Later requests must go to support for review; approval is not guaranteed.',
    draft: { response: 'Absolutely! You qualify for a full refund. Send your order number and I will process it right away.', scores: [1, 2, 5], critical: true, finding: 'The response promises eligibility outside the policy and claims an action it cannot perform.', action: 'Correct the policy boundary, avoid an approval promise and explain the support-review route.' },
    revised: { response: 'The standard refund window is 30 days, so a purchase from 45 days ago is outside that window. You can ask support to review the request, but I cannot guarantee approval or process the refund here.', scores: [5, 5, 4], critical: false, finding: 'The authored revision follows the supplied policy and makes its limits explicit.', action: 'Check tone and escalation instructions against the product’s own requirements before using any revised wording.' }
  },
  uncertainty: {
    label: 'Missing information',
    prompt: 'Will my order arrive tomorrow?',
    reference: 'Fictional context: the assistant has no order lookup, tracking information or delivery estimate.',
    draft: { response: 'Yes, your order will arrive tomorrow before 5 pm.', scores: [1, 1, 5], critical: true, finding: 'The answer invents a delivery commitment without supporting information.', action: 'Acknowledge the missing tracking data and offer a safe next step instead of a specific promise.' },
    revised: { response: 'I cannot confirm tomorrow’s delivery because I do not have your tracking information. Please check the carrier’s tracking page or contact the store’s support team for the latest estimate.', scores: [5, 5, 5], critical: false, finding: 'The authored revision separates what is known from what needs checking.', action: 'Verify the approved support route and add it if available. This one example does not establish overall model quality.' }
  }
};

export const seoIssues = [
  { id: 'S01', priority: 'High', page: '/services', evidence: 'Illustrative HTML contains a noindex directive on a page intended for search.', action: 'Confirm the intended visibility before removing the directive.', verify: 'Inspect the rendered robots directive and request indexing through the owner’s tools if appropriate.' },
  { id: 'S02', priority: 'High', page: '/contact', evidence: 'Illustrative primary enquiry link points to a missing destination.', action: 'Update the link to the approved destination.', verify: 'Follow the link on desktop and mobile; check that the intended page responds.' },
  { id: 'S03', priority: 'Medium', page: '/services + /about', evidence: 'Illustrative pages use the same generic title: “Home”.', action: 'Write distinct, descriptive titles that match each page’s purpose.', verify: 'Inspect each rendered title after the change.' },
  { id: 'S04', priority: 'Investigate', page: '/', evidence: 'Illustrative hero image appears large. No load-time measurement is supplied.', action: 'Measure before choosing compression, resizing or delivery changes.', verify: 'Record a dated mobile test with tool settings and distinguish lab results from field data.' }
];

export function getOffer(key) { return Object.hasOwn(offers, key) ? offers[key] : offers.qa; }
export function scoreExample(example) {
  const score = (example.scores[0] * 0.5 + example.scores[1] * 0.3 + example.scores[2] * 0.2).toFixed(1);
  return { score, verdict: example.critical ? 'Needs correction' : 'Meets this example’s criteria' };
}
export function filterIssues(priority) {
  return priority === 'All' ? seoIssues : seoIssues.filter(issue => issue.priority === priority);
}
export function createBrief({ service, scope, timing, context = '' }) {
  const offer = getOffer(service);
  const selectedScope = offer.scope.includes(scope) ? scope : offer.scope[0];
  const allowedTimes = ['Flexible — agree a timeline', 'Within 2 weeks, if feasible', 'Within a month'];
  const desiredTiming = allowedTimes.includes(timing) ? timing : allowedTimes[0];
  const safeContext = String(context).slice(0, 600).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  return `PROJECT ENQUIRY — ${offer.name}\n\nWhat I need: ${selectedScope}\nPreferred timing: ${desiredTiming}\n\nContext: ${safeContext || '[Add a non-sensitive description of the problem]'}\n\nDeliverables to discuss:\n${offer.output.map(item => '- ' + item).join('\n')}\n\nInputs to prepare:\n${offer.inputs}\n\nScope boundaries:\n${offer.boundary}\n\nPlease confirm the final scope, price, timeline and revision allowance before starting. This draft is an enquiry, not an order or agreement.\n`;
}
