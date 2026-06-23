Hackathon Problem Statement Template
1. Problem Title
Designing Transparent & Trustworthy AI Agent Interfaces
2. Background / Context
The rapid adoption of AI agents in enterprise platforms is reshaping how Users interact with software. AI agents can now autonomously recommend configurations, detect anomalies, trigger remediation workflows, and manage complex device fleets, all without explicit human instruction for each step.
In domains such as IT operations, security management, and device lifecycle management, platforms like Microsoft Intune, VMware Workspace ONE etc., are beginning to surface AI-driven recommendations to IT administrators. These admins are responsible for the security and uptime of thousands of devices and rely on reliable, interpretable guidance.
However, most current AI interfaces are opaque, they present a recommendation or action without explaining the reasoning behind it, the data it relied on, or the confidence level associated with that output. This lack of transparency creates adoption barriers, reduces trust, and increases cognitive load on the admin who must decide whether to accept the AI's suggestion.
The challenge for designers and developers is to build interfaces that make AI reasoning legible, trustworthy, and actionable, without overwhelming the user or requiring them to have an ML background.
3. Problem Description (The Core Problem)
AI agents taking autonomous actions on behalf of users are fundamentally different from traditional rule-based tools. They involve probabilistic reasoning, dynamic data inputs, and non-deterministic outputs. Most current UI patterns were not designed to accommodate this class of system.
The core problem has three dimensions:
●	Opacity: Users cannot see how the AI arrived at a recommendation — which data was used, what logic was applied, and what alternatives were considered.
●	Calibration uncertainty: Users have no way to gauge whether they should trust a recommendation highly or treat it with caution. Confidence indicators are absent or poorly communicated.
●	Accountability gap: When an AI-driven action goes wrong, users lack the audit trail or explanation needed to understand what happened, making it hard to course-correct or escalate.
The result is a trust deficit that causes hesitation, manual overrides, or outright avoidance of AI features — negating the value that these systems are designed to deliver.
4. Objectives / Desired Outcomes
Participants are expected to achieve the following outcomes:
●	Design a UI concept that surfaces AI reasoning steps in plain, non-technical language — making the agent's thought process visible to a non-expert user.
●	Communicate confidence levels and uncertainty in a visually intuitive way (e.g., visual indicators, colour-coded bands, or plain-language confidence descriptors).
●	Clearly attribute data sources used by the AI so users understand the basis for a recommendation.
●	Expose the agent's known limitations and scope boundaries — what it does not know and when it may be wrong.
●	Design interaction patterns that keep the human in the loop: the ability to approve, override, escalate, or request more explanation before any consequential action is taken.
●	Validate the design with real users using structured usability testing methods.
5. Scope Definition
In Scope:
●	UI/UX design for a dashboard-style interface suitable for an IT admin persona.
●	Visual and interaction design covering: recommendation cards, reasoning panels, confidence indicators, data source attribution, and human-in-the-loop controls.
●	A working interactive prototype using Figma (preferred), Google Stitch or any other prototyping tool.
●	Integration or simulation of AI outputs using one of the provided datasets or Hugging Face model outputs.
●	Usability validation with a minimum of 5 participants using defined test methods.
●	Web-first or Desktop-first 
Out of Scope:
●	Building a production-grade backend or training a custom ML model from scratch.
●	Full mobile app design (web-first or desktop-first is sufficient).
●	Legal or regulatory compliance frameworks for AI — focus is on UX, not governance documentation.


6. Constraints / Limitations
●	•  Non-technical communication only — All AI reasoning, confidence levels, and data source information must be expressed in plain language. No raw model outputs, probability distributions, or ML jargon may appear in the interface. 
●	•  Provided datasets only — Teams must simulate AI behaviour using one of the three specified datasets (UCI ML Repository, Hugging Face model outputs, or Python Faker-generated IT logs). Live organisational data or externally sourced datasets are not allowed. 
●	•  Human approval required for consequential actions — The interface must not allow the AI agent to execute any high-impact action (e.g., quarantine, patch rollout, config change) without an explicit human confirmation step. Fully autonomous action flows are out of scope. 
●	•  Transparency elements are mandatory, not optional — All five core elements — reasoning steps, confidence level, data source attribution, known limitations, and human-in-the-loop controls — must be present in the prototype. Partial implementations will be evaluated accordingly.
7. Assumptions
●	The primary target user (IT Admin) has domain expertise in device management but is not expected to have machine learning or data science knowledge.
●	The AI agent is assumed to be pre-trained; teams do not need to build or fine-tune a model — simulating outputs using the provided datasets is acceptable.
●	Participants have access to a laptop, stable internet connection, and the free tier of Figma for the duration of the event.
●	Usability test participants (peers, faculty, or recruited volunteers) are available to teams during the hackathon window.
●	The judging panel will evaluate design rationale and UX quality as primary criteria; backend robustness is secondary.
8. Target Users / Personas
Primary: IT Administrator	Responsible for managing a fleet of 500–5,000 endpoint devices. Technically proficient in IT operations but not in AI/ML. Makes high-stakes decisions daily (security patches, quarantines, config rollouts). Values accuracy, speed, and audit traceability over visual novelty.
Secondary: IT Security Analyst	Reviews security event logs and AI-flagged anomalies. Needs confidence scores and data source attribution to decide whether to escalate an event. Comfortable with data but not with opaque black-box recommendations.
Tertiary: Non-Technical Stakeholder	Department manager or compliance officer who occasionally reviews AI activity logs. Needs a plain-language summary view of what the AI did and why — without technical jargon.
9. Current State Summary
In most existing enterprise device management and IT security platforms today:
●	AI recommendations appear as notifications or action cards with a brief label (e.g., "Apply patch" or "Quarantine device") — no explanation is provided.
●	Confidence levels are either absent or presented as a raw percentage (e.g., 87%) without contextual framing, leaving users unsure whether 87% should be trusted or questioned.
●	Data sources are invisible — users cannot determine whether a recommendation was based on telemetry data, a policy rule, a model prediction, or a combination.
●	There is no structured escalation path: users can approve or dismiss but cannot ask the AI to explain itself, request alternatives, or flag a recommendation for human review.
●	Audit trails for AI actions are typically buried in system logs, inaccessible to frontline IT admins without administrative database access.
10. Expected Target State / Vision
The envisioned future state is an AI agent interface that:
●	Presents every AI recommendation alongside a plain-language explanation of why the recommendation was made, written for a non-ML audience.
●	Displays a contextualised confidence indicator — not just a number, but a qualitative label (e.g., High Confidence, Review Recommended) — with a brief note on what factors influenced it.
●	Cites data sources explicitly (e.g., "Based on telemetry from 342 similar devices in your fleet over the last 14 days").
●	Includes a visible limitations disclaimer when the agent is operating at the edge of its known capability (e.g., "This recommendation has not been validated on this device model").
●	Provides human-in-the-loop controls: Approve, Override, Ask Why, See Alternatives, and Escalate to Human Review.
●	Maintains a transparent, searchable activity log that records every AI action, its rationale, and the human decision that followed — accessible in plain language from the main dashboard.
The net result is an interface where users develop calibrated trust in the AI — relying on it where it is strong, overriding it where they have better context, and always knowing what it did and why.
11. Success Metrics & Acceptance Criteria
Comprehension Accuracy	At least 7 of 10 non-technical test users can correctly explain what the AI decided and why, when shown the prototype for 5 minutes.
Usability Test Coverage	A minimum of 5 think-aloud protocol sessions are completed and documented with findings.
Feature Completeness	Prototype demonstrates all five core transparency elements: reasoning, confidence, data source, limitations, and human-in-the-loop controls.
Prototype Fidelity	Interactive prototype with at least 3 connected screens / states. Static mockups without interaction are not sufficient.
Presentation Clarity	Team can articulate design rationale and research findings within a 10-minute demo presentation.

12. Risks & Dependencies
Risk / Dependency	Mitigation
Over-engineering the ML component at the cost of UX quality	Use pre-built model outputs from Hugging Face or simulate data with Python Faker. Spend at least 60% of the time on design and testing.
Difficulty recruiting usability test participants during the event	Identify participants before the hackathon begins. Peer participants and faculty are acceptable personas.
Scope creep beyond what is achievable in 24 hours	Define an MVP scope in the first 2 hours. Reserve the final 3 hours for testing and presentation prep.
Figma free-tier limitations (collaboration, prototyping)	One team member should own the Figma file and share screens for collaboration. 
Dataset unfamiliarity causing delays	Review the three provided datasets before the event starts. Choose one dataset and commit to it within the first hour.

13. Expected Deliverables from Participants
●	Interactive Prototype: A Figma prototype or an equivalent prototype of the concept with a minimum of 3-5 linked screens demonstrating all five transparency elements.
●	Design Rationale Deck: A concise slide deck (8–12 slides) explaining the problem interpretation, design decisions, persona insights, and key UX patterns used.
●	Usability Test Report: A written summary of findings from at least 5 think-aloud sessions.
●	Source Files: Figma source file (shared link) and/or Python source code repository (GitHub link).
●	Demo Video (Optional but recommended): A 3–5 minute screen recording walking through the prototype, narrated by a team member.
14. Provided Inputs / Resources for Hackathon Teams
Datasets:
●	Hugging Face Datasets: Pre-trained model pipelines with confidence scores for text classification, usable as a proxy for IT alert classification.
●	Synthetic IT Logs: Generated using the Python Faker library — teams can create simulated device telemetry, patch events, and security alert logs.
Tools:
●	Figma (free tier) — for UI design and interactive prototyping.
●	Or any similar equivalent

AI / ML Libraries:
●	Hugging Face Transformers — for accessing pre-trained model outputs.
●	SHAP and LIME — for generating model explainability visualizations.

Learning Resources:
●	Google PAIR Explorables — interactive guides on human-centred AI design.
●	IBM AI Fairness 360 documentation — reference for transparency and fairness concepts.
●	"Explainable AI" course on Coursera.
●	UXAI.design community articles.

15. Evaluation Criteria

Criterion	Weightage & Description
UX Design Quality (30%)	Visual clarity, hierarchy, consistency, and overall intuitiveness of the interface. Does it feel like a real product?
Transparency Implementation (25%)	How effectively are the five transparency elements (reasoning, confidence, data source, limitations, human control) embedded and communicated?
Usability Validation (20%)	Quality and rigour of the usability testing — participant diversity, test methodology, findings depth, and measurable outcomes (NASA-TLX, comprehension score).
Innovation & Novelty (15%)	Original interaction patterns, creative approaches to explainability, or novel visual metaphors that go beyond conventional UI patterns.
Presentation & Communication (10%)	Clarity of the team's demo, the coherence of the design rationale, and the quality of the final slide deck.

16. Stretch Goals (Bonus Points)
Teams that complete the core deliverables and have additional capacity may attempt the following for bonus recognition:
●	Multi-Agent Transparency: Design an interface that shows not one but a chain of AI agents collaborating — e.g., a detection agent flagging a device, passing context to a remediation agent. Show how their handoff is communicated to the admin.
●	Autonomy Dial: Include a global or per-action control that lets the IT admin set how autonomous the AI is allowed to be — from "Always ask me" to "Act and notify" — and show how the interface adapts accordingly.
●	Accessibility Compliance: Ensure the prototype meets WCAG 2.1 AA standards and include a brief accessibility audit.
●	Live Model Integration: Connect the prototype to a real Hugging Face inference endpoint and render live model confidence scores and SHAP values in the UI.
●	AI Incident Report: Design an "AI Incident Card" — a structured summary generated whenever an AI action leads to an unintended outcome — covering what happened, why, and what safeguard failed.

17. Additional References / Links
Resource	URL / Reference
UCI ML Repository	https://archive.ics.uci.edu/ml/index.php
Hugging Face Datasets	https://huggingface.co/datasets
Google PAIR Explorables	https://pair.withgoogle.com/explorables/
IBM AI Fairness 360	https://aif360.res.ibm.com/
SHAP Library (GitHub)	https://github.com/shap/shap
LIME Library (GitHub)	https://github.com/marcotcr/lime
Streamlit Documentation	https://docs.streamlit.io
Gradio Documentation	https://www.gradio.app/docs/
Explainable AI – Coursera	https://www.coursera.org (search: Explainable AI)
UXAI Design Community	https://uxai.design
NASA-TLX Questionnaire	https://humansystems.arc.nasa.gov/groups/tlx/
Figma (Free Tier)	https://www.figma.com
Python Faker Library	https://faker.readthedocs.io/en/master/


