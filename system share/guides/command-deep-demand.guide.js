const GUIDE_COMMAND_DEEP_DEMAND = {
    id: 'commandDeepDemand',
    title: 'Command Deep Demand — Diagnosis → Rails → Pilots',
    description: 'A concise, action-ready synthesis of the 23__ series: identify command failures, lay down rails, and execute pilots within 180 days.',
    category: 'System Architecture',
    tags: ['deep-demand', 'duty-bands', 'bounties', 'corridors', 'open-cure', 'proof-of-care', 'pilots'],
    estimatedTime: '20 minutes',

    steps: [
        {
            title: 'Executive Frame',
            content: [
                { type: 'paragraph', text: 'Markets and democracies systematically fail to command meaningful, deeply demanded, and long-horizon intelligent work. The 23__ series condenses why—and how to replace command failure with rails that route human effort to care.' },
                { type: 'list', items: [
                    'Problem: Command failure stack (money, narrative/status, dysgenic selection, democratic shorts, credential gates).',
                    'Answer: Duty bands, public bounties, supervised corridors, open-cure charters, proof-of-care ledger.',
                    'Action: 180-day pilots with ruthless measurement and iterative scale.'
                ]}
            ]
        },
        {
            title: 'Diagnosis — Where Commands Die',
            content: [
                { type: 'concept', title: 'Five Locks', text: '- Monetary drowning and extraction (85–95% diversion)\n- Status capture and narrative gating (story wins over survival)\n- Dysgenic selection (problem-solvers reproduce least)\n- Democratic paralysis (2–4y horizons, compromise cascade)\n- Credential monopolies (competence blocked by paper)' },
                { type: 'list', items: [
                    'Check yourself: Which lock blocks your work today?',
                    'Name the smallest unit of change that opens that lock for one case.'
                ]},
                { type: 'connection', text: 'Read: 23__diagnosis.md; 23 discussion - intelligence_command_analysis.md; 23_meta_discussion.md.' }
            ]
        },
        {
            title: 'Rails — Route Effort to Care',
            content: [
                { type: 'concept', title: 'Duty Bands', text: 'Replace salary coercion with voluntary duty commitments at provision cost. Guarantee survival (BARRACKS) so people can choose vital work, with Azure/TRUTH gating who can access which zero-sum assets and Crimson/TASTE letting crews trade across every other dimension (see foundations/BARRACKS sorting dual-layer.md + 23 COMMAND rails).' },
                { type: 'concept', title: 'Public Bounties', text: 'Time-boxed milestones with open eligibility and transparent adjudication. 100% payout on verified outcomes.' },
                { type: 'concept', title: 'Corridors (Walls With Doors)', text: 'Supervised access to real tasks with recipient consent and graduated authority based on outcomes.' },
                { type: 'concept', title: 'Open-Cure Charters', text: 'Zero-profit vital domains with 100% reinvestment, time-bounded exclusivity, open formulas on expiry.' },
                { type: 'connection', text: 'Read: 23__solutions.md; 23__series_architecture.md.' }
            ]
        },
        {
            title: 'Governance — Civic OS',
            content: [
                { type: 'paragraph', text: 'Contributor-weighted participation; dual-lane safety (supervised practice vs open experimentation); audit trails; exit rights. Authority accrues to demonstrated competence and care outcomes.' },
                { type: 'connection', text: 'Read: 23__series_architecture.md; 47d The Will-Disruption Tragedy — How Democracy Compromises Everyone Into Gray.md; 17 crucible_sovereignty_system.md.' }
            ]
        },
        {
            title: 'Metrics — Proof of Care',
            content: [
                { type: 'list', items: [
                    'Patient-years saved (primary).',
                    'Cohort survival uplift vs baseline.',
                    'Productive-overhead ratio (target ≥ 0.7).',
                    'Cycle-time to deployment (first care in days, not years).',
                    'Talent-transfer rate from parasitic domains.'
                ]},
                { type: 'concept', title: 'Ledger', text: 'Public, recipient-verified ledger linking bounties, corridors, and outcomes. Funds follow proof.' }
            ]
        },
        {
            title: 'Pilots — 180 Days to Evidence',
            content: [
                { type: 'concept', title: 'P1 BARRACKS Cost Floor', text: 'Provision 20 people at ≤$250/person/month; compare productivity/quality of life vs baseline. Use Sorting Hat lobbies (Azure/TRUTH × Crimson/TASTE) to keep high-risk entrants in rugged quarters while complementary builders earn regal pods.' },
                { type: 'concept', title: 'P2 Trust Network', text: '1,000-user competence-over-credentials test; measure fraud rate, outcome quality, reputation accuracy.' },
                { type: 'concept', title: 'P3 Compressed Training', text: '40 trainees over 36 months vs traditional track; head-to-head on diagnostics/treatment outcomes.' },
                { type: 'concept', title: 'P4 Social Currencies', text: 'Visible leaderboards and voluntary promises; track career redirection and reproduction commitments.' },
                { type: 'concept', title: 'P5 Integrated City (post-P1–P4)', text: 'Only after components validate; target ≥10x lives saved per dollar.' },
                { type: 'connection', text: 'Read: 23__pilots.md.' }
            ]
        },
        {
            title: 'Month One — Concrete Moves',
            content: [
                { type: 'list', items: [
                    'Stand up a minimal Proof-of-Care ledger (recipient verification + public entries).',
                    'Publish 3 bounties with crisp milestone definitions and adjudication rules.',
                    'Open 1 supervised corridor/week (small, competence-gated tasks).',
                    'Launch 20-person BARRACKS pilot budget and intake (Azure/TRUTH placement + Crimson/TASTE choice orchestrated via COMMAND).',
                    'Recruit 50 cross-domain volunteers; route into corridors with outcome tracking.'
                ]},
                { type: 'connection', text: 'Read: 23a the_dying_child_ultimatum.md; 23b intelligence_command_failure.md.' }
            ]
        },
        {
            title: 'Next Guides',
            content: [
                { type: 'paragraph', text: 'Deepen with these guides to operationalize rails:' }
            ],
            nextGuides: [
                'stopParasiticMoneyFlows',
                'howWeDecideWhatGetsBuilt',
                'trustNetworks',
                'openHealingDiscoverySaveTheDying',
                'walkDontLobbyFoodMedicine'
            ]
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GUIDE_COMMAND_DEEP_DEMAND;
}


