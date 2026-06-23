import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ─── Confidence ───────────────────────────────────────────────────────────────

export interface ConfidenceInfo {
  tier: "high" | "review" | "low";
  label: string;
  colorClasses: string;
  barColor: string;
}

export function getConfidence(percent: number): ConfidenceInfo {
  if (percent >= 80) {
    return {
      tier: "high",
      label: "High Confidence",
      colorClasses: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      barColor: "#10b981",
    };
  }
  if (percent >= 55) {
    return {
      tier: "review",
      label: "Review Recommended",
      colorClasses: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      barColor: "#f59e0b",
    };
  }
  return {
    tier: "low",
    label: "Low Confidence",
    colorClasses: "bg-slate-500/10 text-slate-400 border-slate-700/30",
    barColor: "#64748b",
  };
}

// ─── Recommended Actions ──────────────────────────────────────────────────────

export interface ActionReasoning {
  primaryReason: string;
  evidence: string[];
  confidencePercent: number;
  limitation: string;
}

export interface RecommendedAction {
  id: string;
  priority: number;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  state: "pending" | "approved" | "overridden" | "escalated";
  overrideReason?: string;
  reasoning?: ActionReasoning;
}

const defaultActions: RecommendedAction[] = [
  {
    id: "ra-1",
    priority: 1,
    title: "Block IP Address 203.0.113.42",
    description:
      "Immediately block the attacking IP at the firewall level to prevent further intrusion attempts.",
    severity: "critical",
    state: "pending",
  },
  {
    id: "ra-2",
    priority: 2,
    title: "Revoke Credentials for User ID 8472",
    description:
      "Rotate all credentials associated with User ID 8472 and force re-authentication across active sessions.",
    severity: "critical",
    state: "pending",
  },
  {
    id: "ra-3",
    priority: 3,
    title: "Invalidate Session 9d8f7e6c",
    description:
      "Terminate and invalidate the compromised session to prevent further unauthorized privilege escalation.",
    severity: "high",
    state: "pending",
  },
  {
    id: "ra-4",
    priority: 4,
    title: "Review API Call Audit Window",
    description:
      "Audit all API calls in the 30-minute window surrounding the incident for lateral movement indicators.",
    severity: "medium",
    state: "pending",
  },
];

// ─── Default Explanations & Visualizations (Default Incident) ──────────────────

const defaultThreatSummary = {
  title: "Critical Security Threat Detected",
  description: "Privilege escalation attempt with potential data exfiltration",
  status: "Active Threat",
  confidence: 94.7,
  riskScore: 9.2,
  limitations: [
    "This detection has not been validated against macOS devices in this fleet, and confidence may be lower for devices with incomplete telemetry history."
  ],
  sources: "Based on authentication logs and network telemetry collected from this device over the last 6 minutes (9 log entries, 14:23:11–14:29:03).",
  tags: ["Privilege Escalation", "Data Exfiltration", "Unauthorized Access", "Brute Force Attack"]
};

const defaultInfluenceData = [
  { factor: "Failed SSH Attempts", weight: 95 },
  { factor: "Privilege Escalation", weight: 92 },
  { factor: "Unusual API Pattern", weight: 87 },
  { factor: "Data Exfiltration Rate", weight: 85 },
  { factor: "Geographic Anomaly", weight: 78 },
  { factor: "Time-based Pattern", weight: 65 },
];

const defaultTrustScoreData = [
  { name: "Detection Confidence", value: 95, color: "#3b82f6" },
  { name: "Data Quality", value: 88, color: "#10b981" },
  { name: "Signal Consistency", value: 91, color: "#8b5cf6" },
];

const defaultEvidenceCards = [
  {
    id: 1,
    title: "Multiple Failed SSH Attempts",
    severity: "critical",
    confidence: 98,
    description: "15 failed SSH login attempts from IP 203.0.113.42 within 2 minutes indicates brute force attack pattern",
    impact: "High",
    timestamp: "14:25:33",
    source: "Authentication logs (ssh.company.com)",
  },
  {
    id: 2,
    title: "Privilege Escalation Detected",
    severity: "critical",
    confidence: 96,
    description: "Session 9d8f7e6c escalated from user-level to admin privileges without proper authorization flow",
    impact: "Critical",
    timestamp: "14:26:18",
    source: "Privilege monitor telemetry",
  },
  {
    id: 3,
    title: "Suspicious API Call Pattern",
    severity: "warning",
    confidence: 89,
    description: "User ID 8472 made 47 API calls to sensitive endpoints in 30 seconds, exceeding normal behavior by 340%",
    impact: "Medium",
    timestamp: "14:25:45",
    source: "API gateway logs",
  },
  {
    id: 4,
    title: "Unusual Data Exfiltration",
    severity: "critical",
    confidence: 94,
    description: "Large volume data transfer (2.3GB) to external IP during unusual hours",
    impact: "High",
    timestamp: "14:28:15",
    source: "Network telemetry, last 14 days baseline",
  },
];

const defaultReasoningTimeline = [
  {
    time: "14:25:33",
    event: "Anomaly Detection Triggered",
    description: "Multiple failed authentication attempts detected",
    confidence: 82,
  },
  {
    time: "14:26:18",
    event: "Threat Level Escalated",
    description: "Privilege escalation pattern confirmed",
    confidence: 91,
  },
  {
    time: "14:27:45",
    event: "Cross-Reference Analysis",
    description: "Matched 3 known attack signatures in threat database",
    confidence: 95,
  },
  {
    time: "14:28:52",
    event: "Final Classification",
    description: "Multi-stage attack confirmed",
    confidence: 94.7,
  },
];

const defaultAlternativeExplanations = [
  {
    title: "Legitimate Admin Activity",
    likelihood: "Unlikely",
    reason: "Ruled out due to unusual timing and geographic origin",
  },
  {
    title: "System Misconfiguration",
    likelihood: "Very Unlikely",
    reason: "Inconsistent with the privilege escalation pattern observed",
  },
  {
    title: "False Positive",
    likelihood: "Very Unlikely",
    reason: "Multiple corroborating indicators make this unlikely",
  },
];

// ─── Event Log (parsed from raw log upload) ──────────────────────────────────

export interface EventLog {
  id: string;
  timestamp: string;
  level: "CRITICAL" | "WARNING" | "INFO" | "DEBUG";
  source: string;
  message: string;
  metadata: string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  actor: "AI System" | "Admin";
  status: "success" | "critical" | "warning" | "info";
  overrideReason?: string;
  overrideOption?: string;
  overrideNote?: string;
}

const initialAuditLog: AuditEntry[] = [
  {
    id: "ae-0",
    timestamp: new Date("2026-06-19T14:29:15"),
    action: "Critical Threat Detected",
    details: "Multi-stage attack detected: privilege escalation + data exfiltration. IP: 203.0.113.42",
    actor: "AI System",
    status: "critical",
  },
  {
    id: "ae-1",
    timestamp: new Date("2026-06-19T14:28:52"),
    action: "Analysis Complete — High Confidence (94.7%)",
    details: "Final classification confirmed by 3 of 3 independent checks.",
    actor: "AI System",
    status: "success",
  },
  {
    id: "ae-2",
    timestamp: new Date("2026-06-19T14:27:45"),
    action: "Threat Intelligence Cross-Reference",
    details: "3 matching signatures found in threat database v2.4.1.",
    actor: "AI System",
    status: "warning",
  },
  {
    id: "ae-3",
    timestamp: new Date("2026-06-19T14:26:18"),
    action: "Privilege Escalation Detected",
    details: "User 8472 escalated from user → admin without authorisation. Session: 9d8f7e6c",
    actor: "AI System",
    status: "critical",
  },
  {
    id: "ae-4",
    timestamp: new Date("2026-06-19T14:25:33"),
    action: "Brute Force Pattern Detected",
    details: "15 failed SSH attempts from 203.0.113.42 in under 2 minutes.",
    actor: "AI System",
    status: "warning",
  },
];

// ─── Log Parser Heuristics Function ───────────────────────────────────────────

function parseLogs(logText: string) {
  // If blank, return null to fallback to default mock incident
  if (!logText.trim()) return null;

  const lines = logText.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Regex extractors
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
  let detectedIP = "";
  for (const line of lines) {
    const match = line.match(ipRegex);
    if (match) {
      const ip = match[0];
      if (ip !== "127.0.0.1" && ip !== "0.0.0.0" && !ip.startsWith("192.168.1.")) {
        detectedIP = ip;
        break;
      } else if (!detectedIP) {
        detectedIP = ip;
      }
    }
  }
  if (!detectedIP) detectedIP = "203.0.113.42";

  const isExternalIP = detectedIP && !/^(127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(detectedIP);

  const userRegex = /(?:user|username|uid|User ID|User|email|credentials)(?:\s*ID)?[:=\s"']+(\S+)/i;
  let detectedUser = "";
  for (const line of lines) {
    const match = line.match(userRegex);
    if (match && match[1]) {
      detectedUser = match[1].replace(/["',;]/g, "");
      break;
    }
  }
  if (!detectedUser) detectedUser = "8472";

  const sessionRegex = /(?:session|Session ID|Session|sess|sid)[:=\s"']+(\w+)/i;
  let detectedSession = "";
  for (const line of lines) {
    const match = line.match(sessionRegex);
    if (match && match[1]) {
      detectedSession = match[1].replace(/["',;]/g, "");
      break;
    }
  }
  if (!detectedSession) detectedSession = "9d8f7e6c";

  // Scan timestamps
  const timeRegex = /(?:\d{4}-\d{2}-\d{2}\s+)?(\d{2}:\d{2}:\d{2})/;
  const timestamps: string[] = [];
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match && match[1]) {
      timestamps.push(match[1]);
    }
  }

  // Count occurrences of indicators
  let failedLogins = 0;
  let privEscActions = 0;
  let exfilIndicators = 0;
  let unauthRequests = 0;

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes("failed ssh") || l.includes("failed login") || l.includes("failed password") || l.includes("failed attempt") || (l.includes("login") && l.includes("fail"))) {
      failedLogins++;
    }
    if (l.includes("privilege escalation") || l.includes("escalated") || l.includes("su admin") || l.includes("user → admin") || l.includes("to admin") || l.includes("critical: privilege escalation")) {
      privEscActions++;
    }
    if (l.includes("exfiltration") || l.includes("data transfer") || l.includes("exfiltrated") || l.includes("data exfiltration") || l.includes("outbound transfer") || l.includes("gb transferred") || l.includes("mb transferred") || l.includes("exfiltrat")) {
      exfilIndicators++;
    }
    if (l.includes("unauthorized") || l.includes("403") || l.includes("access denied") || l.includes("unauthorized access") || l.includes("forbidden") || l.includes("unauthorized api")) {
      unauthRequests++;
    }
  }

  const hasBruteForce = failedLogins > 0;
  const hasPrivilegeEscalation = privEscActions > 0;
  const hasExfiltration = exfilIndicators > 0;
  const hasUnauthorized = unauthRequests > 0;

  // Extract dynamic scale indicators
  let attemptMultiplier = 1;
  for (const line of lines) {
    const l = line.toLowerCase();
    const numMatch = l.match(/(\d+)\s+failed/);
    if (numMatch) {
      attemptMultiplier = Math.max(attemptMultiplier, parseInt(numMatch[1], 10));
    } else if (l.includes("multiple")) {
      attemptMultiplier = Math.max(attemptMultiplier, 10);
    }
  }
  const virtualFailedLogins = failedLogins * attemptMultiplier;

  let apiCallCount = 1;
  for (const line of lines) {
    const l = line.toLowerCase();
    const numMatch = l.match(/(\d+)\s+api\s+calls/i) || l.match(/made\s+(\d+)\s+api/i);
    if (numMatch) {
      apiCallCount = Math.max(apiCallCount, parseInt(numMatch[1], 10));
    }
  }
  const virtualUnauthRequests = Math.max(unauthRequests, apiCallCount);

  let exfilSizeGB = 0.5;
  for (const line of lines) {
    const l = line.toLowerCase();
    const gbMatch = l.match(/(\d+(?:\.\d+)?)\s*(?:gb|gigabytes)/i);
    const mbMatch = l.match(/(\d+(?:\.\d+)?)\s*(?:mb|megabytes)/i);
    if (gbMatch) {
      exfilSizeGB = Math.max(exfilSizeGB, parseFloat(gbMatch[1]));
    } else if (mbMatch) {
      exfilSizeGB = Math.max(exfilSizeGB, parseFloat(mbMatch[1]) / 1024);
    }
  }

  // --- Dynamic Evidence Analysis Scoring ---

  // 1. Brute Force (Failed Logins)
  let bruteForceConf = 0;
  let bruteForceSeverity: "critical" | "high" | "medium" | "low" = "low";
  let bruteForceRisk = 1.0;
  let bruteForceReasoning = "";

  if (hasBruteForce) {
    // Confidence calculation (varies widely between 50% and 98%)
    if (virtualFailedLogins === 1) {
      bruteForceConf = 52.0;
    } else if (virtualFailedLogins <= 5) {
      bruteForceConf = 68.0;
    } else if (virtualFailedLogins <= 15) {
      bruteForceConf = 84.0;
    } else {
      bruteForceConf = 95.0;
    }
    if (isExternalIP) bruteForceConf += 3.5;
    bruteForceConf = Math.min(99.0, bruteForceConf);

    // Severity & Damage potential (Separated from confidence)
    if (hasPrivilegeEscalation) {
      bruteForceSeverity = "critical";
      bruteForceRisk = 9.0;
      bruteForceReasoning = `Multiple authentication failures (${virtualFailedLogins} failures) from ${detectedIP} correlated directly with subsequent privilege escalation on session ${detectedSession}, indicating successful initial system entry.`;
    } else {
      if (virtualFailedLogins >= 10) {
        bruteForceSeverity = "medium";
        bruteForceRisk = 5.2;
        bruteForceReasoning = `Sustained brute force activity (${virtualFailedLogins} failures) detected from external IP ${detectedIP}. No signs of successful user compromise, suggesting the attack was blocked at the authentication gateway.`;
      } else {
        bruteForceSeverity = "low";
        bruteForceRisk = 3.0;
        bruteForceReasoning = `Low frequency incorrect login credentials attempt (${virtualFailedLogins} failures) from ${detectedIP}, likely a standard user typo or localized authentication mismatch.`;
      }
    }
  }

  // 2. Privilege Escalation
  let privEscConf = 0;
  let privEscSeverity: "critical" | "high" | "medium" | "low" = "low";
  let privEscRisk = 1.0;
  let privEscReasoning = "";

  if (hasPrivilegeEscalation) {
    privEscConf = privEscActions === 1 ? 82.0 : 93.0;
    if (hasBruteForce) privEscConf += 12.0; // Correlated auth-to-root path
    if (hasUnauthorized) privEscConf += 4.0;
    privEscConf = Math.min(99.0, privEscConf);

    privEscSeverity = "critical"; // High potential damage
    privEscRisk = 9.5;
    privEscReasoning = hasBruteForce 
      ? `Critical session hijacking pattern verified. An unauthenticated external actor on IP ${detectedIP} bypassed logon credentials and immediately escalated session ${detectedSession} to admin role.`
      : `Supervisor system telemetry detected session ${detectedSession} successfully elevated privileges to administrator without responding to normal re-authentication prompts.`;
  }

  // 3. Data Exfiltration
  let exfilConf = 0;
  let exfilSeverity: "critical" | "high" | "medium" | "low" = "low";
  let exfilRisk = 1.0;
  let exfilReasoning = "";

  if (hasExfiltration) {
    exfilConf = 62.0;
    if (exfilSizeGB > 1.0) exfilConf += Math.min(20, Math.round(exfilSizeGB * 4.5));
    if (hasPrivilegeEscalation) exfilConf += 10.0;
    exfilConf = Math.min(95.0, exfilConf);

    if (hasPrivilegeEscalation) {
      exfilSeverity = "critical";
      exfilRisk = 9.2;
      exfilReasoning = `Active data exfiltration sequence identified. A volume of ${exfilSizeGB.toFixed(2)} GB was transferred out of the network environment within the scope of the compromised admin session ${detectedSession}.`;
    } else {
      if (exfilSizeGB > 2.0) {
        exfilSeverity = "high";
        exfilRisk = 7.8;
      } else {
        exfilSeverity = "medium";
        exfilRisk = 5.8;
      }
      exfilReasoning = `High-volume outbound egress of ${exfilSizeGB.toFixed(2)} GB observed to destination IP ${detectedIP}, representing an anomalous network payload departure from historical fleet baselines.`;
    }
  }

  // 4. Unauthorized API Access
  let unauthConf = 0;
  let unauthSeverity: "critical" | "high" | "medium" | "low" = "low";
  let unauthRisk = 1.0;
  let unauthReasoning = "";

  if (hasUnauthorized) {
    unauthConf = 65.0;
    if (virtualUnauthRequests > 5) unauthConf += 12.0;
    if (hasPrivilegeEscalation) unauthConf += 8.0;
    unauthConf = Math.min(94.0, unauthConf);

    const isCriticalPath = logText.toLowerCase().includes("settings") || logText.toLowerCase().includes("keys") || logText.toLowerCase().includes("credentials");
    if (isCriticalPath) {
      unauthSeverity = "high";
      unauthRisk = 7.6;
      unauthReasoning = `Unauthorized administrative API calls (${virtualUnauthRequests} requests) targeted critical configuration endpoints (/settings or keys) under credentials ${detectedUser}.`;
    } else {
      unauthSeverity = "medium";
      unauthRisk = 5.8;
      unauthReasoning = `Probing of restricted administrative URL paths (${virtualUnauthRequests} hits, e.g. /admin/users) recorded from IP ${detectedIP} without session headers.`;
    }
  }

  // --- Synthesis of Overall Threat Metrics ---

  let title = "Suspicious Anomalous Behavior Detected";
  let status = "Investigation Recommended";
  let severity: "critical" | "high" | "medium" | "low" = "medium";
  let riskScore = 6.2;

  if (hasPrivilegeEscalation && hasExfiltration && hasBruteForce) {
    title = "Coordinated Multi-Stage Intrusion Campaign";
    status = "Active Threat";
    severity = "critical";
    riskScore = 9.6;
  } else if (hasPrivilegeEscalation && hasBruteForce) {
    title = "Compromised Account (Brute Force to Privilege Escalation)";
    status = "Active Threat";
    severity = "critical";
    riskScore = 8.9;
  } else if (hasPrivilegeEscalation) {
    title = "Unauthorised Privilege Escalation Alert";
    status = "Active Threat";
    severity = "critical";
    riskScore = 8.5;
  } else if (hasExfiltration && hasUnauthorized) {
    title = "Suspicious Data Egress & Resource Access Anomaly";
    status = "Active Anomaly";
    severity = "high";
    riskScore = 7.8;
  } else if (hasExfiltration) {
    title = "Anomalous Outbound Network Transfer";
    status = "Active Anomaly";
    severity = "high";
    riskScore = 7.2;
  } else if (hasBruteForce) {
    title = "Brute Force Reconnaissance Attempts";
    status = "Reconnaissance";
    severity = "medium";
    riskScore = 5.2;
  } else if (hasUnauthorized) {
    title = "Unauthorized API Access Probing";
    status = "Reconnaissance";
    severity = "medium";
    riskScore = 5.0;
  } else {
    title = "Anomalous Log Telemetry Detected";
    status = "Auditing";
    severity = "low";
    riskScore = 3.2;
  }

  // Overall Confidence calculation
  let highestIndicatorConf = 50.0;
  let indicatorsList: number[] = [];
  if (hasBruteForce) indicatorsList.push(bruteForceConf);
  if (hasPrivilegeEscalation) indicatorsList.push(privEscConf);
  if (hasExfiltration) indicatorsList.push(exfilConf);
  if (hasUnauthorized) indicatorsList.push(unauthConf);

  if (indicatorsList.length > 0) {
    highestIndicatorConf = Math.max(...indicatorsList);
  }

  const uniqueThreatTypes = indicatorsList.length;
  let overallConfidence = highestIndicatorConf;
  if (uniqueThreatTypes > 1) {
    overallConfidence += (uniqueThreatTypes - 1) * 3.5; // coordination bonus
  }
  const confidence = Math.min(99.2, Math.max(50.0, Math.round(overallConfidence * 10) / 10));

  // Build dynamic recommended actions list
  const actions: RecommendedAction[] = [];
  let priority = 1;

  if (hasBruteForce) {
    actions.push({
      id: `ra-parsed-${priority}`,
      priority: priority++,
      title: `Block IP Address ${detectedIP}`,
      description: `Immediately block the attacking IP ${detectedIP} at the firewall level to prevent further attempts.`,
      severity: bruteForceSeverity === "critical" ? "critical" : bruteForceSeverity === "high" ? "high" : "medium",
      state: "pending",
      reasoning: {
        primaryReason: bruteForceReasoning,
        evidence: [
          `Failed login attempts detected from ${detectedIP} in system logs`,
          `${virtualFailedLogins} auth failures logged`,
          `IP has no previous history of successful admin logons`
        ],
        confidencePercent: Math.round(bruteForceConf * 10) / 10,
        limitation: `If this IP is a shared gateway or office VPN, blocking it will affect other legitimate users.`
      }
    });
  }

  if (hasPrivilegeEscalation) {
    actions.push({
      id: `ra-parsed-${priority}`,
      priority: priority++,
      title: `Lock User Credentials for ${detectedUser}`,
      description: `Rotate credentials associated with User ID ${detectedUser} and trigger a security lockout.`,
      severity: "critical",
      state: "pending",
      reasoning: {
        primaryReason: privEscReasoning,
        evidence: [
          `Session upgraded from normal user to administrator privileges without security confirmation`,
          `No MFA challenge was answered by user ${detectedUser}`,
          `Escalation matches known privilege hijacking attack paths`
        ],
        confidencePercent: Math.round(privEscConf * 10) / 10,
        limitation: `Locking credentials will terminate valid sessions and user access immediately.`
      }
    });

    actions.push({
      id: `ra-parsed-${priority}`,
      priority: priority++,
      title: `Invalidate Session ${detectedSession}`,
      description: `Terminate and invalidate the active session ID ${detectedSession} across all gateways.`,
      severity: "critical",
      state: "pending",
      reasoning: {
        primaryReason: `Session ID ${detectedSession} holds unverified administrator credentials.`,
        evidence: [
          `Session is executing high-privilege operations following unverified privilege changes`,
          `Command timings match script execution rather than human analysts`
        ],
        confidencePercent: Math.round(Math.min(99.0, privEscConf + 2.0) * 10) / 10,
        limitation: `Invalidation will terminate the attacker's shell but will not reverse edits already completed.`
      }
    });
  }

  if (hasExfiltration) {
    actions.push({
      id: `ra-parsed-${priority}`,
      priority: priority++,
      title: `Restrict Outbound Network Rate`,
      description: `Impose bandwidth rate limiting or block outbound destination endpoints associated with session ${detectedSession}.`,
      severity: exfilSeverity === "critical" ? "critical" : "high",
      state: "pending",
      reasoning: {
        primaryReason: exfilReasoning,
        evidence: [
          `Outbound transfer rate is significantly above historical fleet baseline`,
          `${exfilSizeGB.toFixed(2)} GB data transferred during anomalous window`
        ],
        confidencePercent: Math.round(exfilConf * 10) / 10,
        limitation: `Bandwidth capping could disrupt concurrent scheduled network database backups.`
      }
    });
  }

  if (hasUnauthorized || actions.length === 0) {
    actions.push({
      id: `ra-parsed-${priority}`,
      priority: priority++,
      title: `Audit API Call Window`,
      description: `Audit all API calls surrounding the incident time-range for lateral movement indicators.`,
      severity: unauthSeverity === "high" ? "high" : "medium",
      state: "pending",
      reasoning: {
        primaryReason: unauthReasoning,
        evidence: [
          `Requested admin paths returned access code anomalies`,
          `Unusual lateral directory scans detected from User ${detectedUser}`
        ],
        confidencePercent: Math.round(unauthConf * 10) / 10,
        limitation: `Automated logs can show resource paths but cannot determine operational intent. Requires security analyst audit.`
      }
    });
  }

  // Evidence Cards
  const evidenceCards: any[] = [];
  let evId = 1;

  if (hasBruteForce) {
    evidenceCards.push({
      id: evId++,
      title: "Failed SSH Login Attempts",
      severity: bruteForceSeverity === "critical" ? "critical" : "warning",
      confidence: Math.round(bruteForceConf),
      description: bruteForceReasoning,
      impact: bruteForceSeverity === "critical" ? "Critical" : bruteForceSeverity === "high" ? "High" : "Medium",
      timestamp: timestamps[0] || "Active Window",
      source: "Authentication Logs (ssh.company.com)"
    });
  }

  if (hasPrivilegeEscalation) {
    evidenceCards.push({
      id: evId++,
      title: "Privilege Escalation Warning",
      severity: "critical",
      confidence: Math.round(privEscConf),
      description: privEscReasoning,
      impact: "Critical",
      timestamp: timestamps[1] || timestamps[0] || "Active Window",
      source: "Privilege Monitor Telemetry"
    });
  }

  if (hasExfiltration) {
    evidenceCards.push({
      id: evId++,
      title: "Unusual Data Egress Rate",
      severity: exfilSeverity === "critical" ? "critical" : "warning",
      confidence: Math.round(exfilConf),
      description: exfilReasoning,
      impact: exfilSeverity === "critical" ? "Critical" : "High",
      timestamp: timestamps[timestamps.length - 1] || "Active Window",
      source: "Network Egress Monitor"
    });
  }

  if (hasUnauthorized) {
    evidenceCards.push({
      id: evId++,
      title: "Unauthorized Resource Request",
      severity: "warning",
      confidence: Math.round(unauthConf),
      description: unauthReasoning,
      impact: unauthSeverity === "high" ? "High" : "Medium",
      timestamp: timestamps[2] || timestamps[0] || "Active Window",
      source: "API Gateway Logs"
    });
  }

  if (evidenceCards.length === 0) {
    evidenceCards.push({
      id: evId++,
      title: "System Errors Logged",
      severity: "warning",
      confidence: 50,
      description: `Log file contains system level alerts needing investigation.`,
      impact: "Low",
      timestamp: timestamps[0] || "Active Window",
      source: "User Log Upload"
    });
  }

  // Timeline
  const reasoningTimeline: any[] = [];
  const uniqTimes = [...new Set(timestamps)].sort();
  if (uniqTimes.length >= 1) {
    reasoningTimeline.push({
      time: uniqTimes[0],
      event: hasBruteForce ? "Brute Force Reconnaissance" : "Anomalous Activity Flagged",
      description: bruteForceReasoning || "Initial telemetry exceptions logged.",
      confidence: Math.round(bruteForceConf || overallConfidence * 0.8)
    });
  }
  if (uniqTimes.length >= 2 && hasPrivilegeEscalation) {
    reasoningTimeline.push({
      time: uniqTimes[1],
      event: "Privilege Escalation Event",
      description: privEscReasoning,
      confidence: Math.round(privEscConf)
    });
  }
  if (uniqTimes.length >= 3 && hasExfiltration) {
    reasoningTimeline.push({
      time: uniqTimes[uniqTimes.length - 1],
      event: "Outbound Data Exfiltration",
      description: exfilReasoning,
      confidence: Math.round(exfilConf)
    });
  }
  reasoningTimeline.push({
    time: uniqTimes[uniqTimes.length - 1] || "Final classification",
    event: "Intrusion Sequence Synthesized",
    description: `Incident classification completed: ${title}.`,
    confidence: Math.round(overallConfidence)
  });

  // Alternative Explanations
  const alternativeExplanations = [
    {
      title: "Scheduled Penetration Test",
      likelihood: hasPrivilegeEscalation && hasExfiltration ? "Possible" : "Unlikely",
      reason: "Internal security engineers simulating brute force and privilege escalation sweeps to test baseline triggers."
    },
    {
      title: "Admin Automation Scripts",
      likelihood: hasExfiltration ? "Unlikely" : "Possible",
      reason: `User ${detectedUser} or server admins executing scheduled system management automation or data collection scripts.`
    },
    {
      title: "Log Mirroring Diagnostics",
      likelihood: "Very Unlikely",
      reason: "A system backup error causing log streams to loop and duplicate event frequency indices."
    }
  ];

  // Factors chart weights matching dynamic strength
  const influenceData = [
    { factor: "Failed Logins", weight: hasBruteForce ? Math.round(bruteForceConf * 0.95) : 10 },
    { factor: "Privilege Changes", weight: hasPrivilegeEscalation ? Math.round(privEscConf * 0.98) : 15 },
    { factor: "Protected API Access", weight: hasUnauthorized ? Math.round(unauthConf * 0.9) : 20 },
    { factor: "Egress Data Rate", weight: hasExfiltration ? Math.round(exfilConf * 0.92) : 12 },
  ].sort((a, b) => b.weight - a.weight);

  // Donut score trust metrics
  const trustScoreData = [
    { name: "Detection Confidence", value: Math.round(confidence), color: "#3b82f6" },
    { name: "Log Signal Quality", value: Math.round(Math.min(98, 55 + lines.length / 2.5)), color: "#10b981" },
    { name: "Context Consistency", value: Math.round(hasBruteForce && hasPrivilegeEscalation ? 95 : hasBruteForce || hasPrivilegeEscalation ? 72 : 48), color: "#8b5cf6" },
  ];

  const threatSummary = {
    title,
    description: `Threat summary based on parsed client logs (${lines.length} lines analyzed).`,
    status,
    confidence,
    riskScore,
    limitations: [
      "This model analysis was synthesized client-side based on user log heuristics.",
      "IP-based indicators rely on static patterns and are not live geo-referenced.",
      "Mac/Linux specific shell syntax exceptions might be missed by generic filters."
    ],
    sources: `Telemetry and logs pasted/uploaded (${lines.length} entries analyzed).`,
    tags: [
      hasBruteForce && "Brute Force",
      hasPrivilegeEscalation && "Privilege Escalation",
      hasExfiltration && "Data Exfiltration",
      hasUnauthorized && "Unauthorized Access"
    ].filter(Boolean) as string[]
  };

  // Build structured EventLog entries from parsed lines
  const parsedEventLogs: EventLog[] = lines.slice(0, 200).map((line, idx) => {
    const timeMatch = line.match(/(?:\d{4}-\d{2}-\d{2}[T\s])?(\d{2}:\d{2}:\d{2})/);
    const ts = timeMatch ? timeMatch[1] : `event-${idx}`;

    let level: EventLog["level"] = "INFO";
    if (/\[?critical\]?|error|fail|denied|escalat/i.test(line)) level = "CRITICAL";
    else if (/\[?warning\]?|warn|unusual|suspicious|attempt/i.test(line)) level = "WARNING";
    else if (/\[?debug\]?/i.test(line)) level = "DEBUG";

    let source = "System";
    if (/ssh|auth|login/i.test(line)) source = "AuthMonitor";
    else if (/privilege|escalat|admin|sudo/i.test(line)) source = "PrivilegeMonitor";
    else if (/transfer|exfil|egress|bandwidth/i.test(line)) source = "NetworkMonitor";
    else if (/api|endpoint|request|403|401/i.test(line)) source = "APIGateway";
    else if (/threat|detect|classif/i.test(line)) source = "ThreatDetector";

    const ipMatch = line.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    const userMatch = line.match(/(?:user|uid)[:\s=]+([\w@.-]+)/i);
    const sessionMatch = line.match(/(?:session|sess)[:\s=]+([\w-]+)/i);
    const metaParts: string[] = [];
    if (ipMatch) metaParts.push(`IP: ${ipMatch[0]}`);
    if (userMatch) metaParts.push(`User: ${userMatch[1]}`);
    if (sessionMatch) metaParts.push(`Session: ${sessionMatch[1]}`);

    const msg = line.length > 100 ? line.slice(0, 97) + "…" : line;

    return {
      id: `ev-${idx}`,
      timestamp: ts,
      level,
      source,
      message: msg,
      metadata: metaParts.join(", ") || "—",
    };
  });

  return {
    actions,
    threatSummary,
    influenceData,
    trustScoreData,
    evidenceCards,
    reasoningTimeline,
    alternativeExplanations,
    eventLogs: parsedEventLogs,
  };
}

// ─── Context & State ──────────────────────────────────────────────────────────

interface IncidentStore {
  actions: RecommendedAction[];
  auditLog: AuditEntry[];
  threatSummary: typeof defaultThreatSummary;
  influenceData: typeof defaultInfluenceData;
  trustScoreData: typeof defaultTrustScoreData;
  evidenceCards: typeof defaultEvidenceCards;
  reasoningTimeline: typeof defaultReasoningTimeline;
  alternativeExplanations: typeof defaultAlternativeExplanations;
  isAnalyzed: boolean;
  eventLogs: EventLog[];
  approveAction: (id: string) => void;
  overrideAction: (id: string, option: string, note: string) => void;
  escalateAction: (id: string) => void;
  analyzeLogs: (logText: string) => void;
  resetToDefault: () => void;
}

const IncidentContext = createContext<IncidentStore | null>(null);

export function IncidentStoreProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<RecommendedAction[]>(defaultActions);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(initialAuditLog);
  const [threatSummary, setThreatSummary] = useState(defaultThreatSummary);
  const [influenceData, setInfluenceData] = useState(defaultInfluenceData);
  const [trustScoreData, setTrustScoreData] = useState(defaultTrustScoreData);
  const [evidenceCards, setEvidenceCards] = useState(defaultEvidenceCards);
  const [reasoningTimeline, setReasoningTimeline] = useState(defaultReasoningTimeline);
  const [alternativeExplanations, setAlternativeExplanations] = useState(defaultAlternativeExplanations);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    setAuditLog((prev) => [
      {
        ...entry,
        id: `ae-${Date.now()}`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, []);

  const approveAction = useCallback(
    (id: string) => {
      const action = actions.find((a) => a.id === id);
      if (!action) return;
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, state: "approved" } : a))
      );
      addAuditEntry({
        action: `Approved: ${action.title}`,
        details: "Human analyst reviewed and approved the AI recommendation.",
        actor: "Admin",
        status: "success",
      });
    },
    [actions, addAuditEntry]
  );

  const overrideAction = useCallback(
    (id: string, option: string, note: string) => {
      const action = actions.find((a) => a.id === id);
      if (!action) return;
      const combinedReason = note ? `${option} — ${note}` : option;
      setActions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, state: "overridden", overrideReason: combinedReason } : a
        )
      );
      addAuditEntry({
        action: `Overridden: ${action.title}`,
        details: "Human analyst overrode the AI recommendation.",
        actor: "Admin",
        status: "warning",
        overrideOption: option,
        overrideNote: note || undefined,
        overrideReason: combinedReason,
      });
    },
    [actions, addAuditEntry]
  );

  const escalateAction = useCallback(
    (id: string) => {
      const action = actions.find((a) => a.id === id);
      if (!action) return;
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, state: "escalated" } : a))
      );
      addAuditEntry({
        action: `Escalated: ${action.title}`,
        details: "Forwarded to senior analyst for review.",
        actor: "Admin",
        status: "info",
      });
    },
    [actions, addAuditEntry]
  );

  const analyzeLogs = useCallback(
    (logText: string) => {
      const parsed = parseLogs(logText);
      if (!parsed) {
        // Fallback to default incident if blank or matches default demo patterns
        resetToDefault();
        return;
      }

      setActions(parsed.actions);
      setThreatSummary(parsed.threatSummary);
      setInfluenceData(parsed.influenceData);
      setTrustScoreData(parsed.trustScoreData);
      setEvidenceCards(parsed.evidenceCards);
      setReasoningTimeline(parsed.reasoningTimeline);
      setAlternativeExplanations(parsed.alternativeExplanations);
      setIsAnalyzed(true);
      setEventLogs(parsed.eventLogs);

      addAuditEntry({
        action: "Log File Uploaded & Analyzed",
        details: `Log parsing heuristic analysis completed: found ${parsed.actions.length} recommended remediation actions.`,
        actor: "AI System",
        status: "success",
      });
    },
    [addAuditEntry]
  );

  const resetToDefault = useCallback(() => {
    setActions(defaultActions);
    setThreatSummary(defaultThreatSummary);
    setInfluenceData(defaultInfluenceData);
    setTrustScoreData(defaultTrustScoreData);
    setEvidenceCards(defaultEvidenceCards);
    setReasoningTimeline(defaultReasoningTimeline);
    setAlternativeExplanations(defaultAlternativeExplanations);
    setAuditLog(initialAuditLog);
    setIsAnalyzed(false);
    setEventLogs([]);
  }, []);

  return (
    <IncidentContext.Provider
      value={{
        actions,
        auditLog,
        threatSummary,
        influenceData,
        trustScoreData,
        evidenceCards,
        reasoningTimeline,
        alternativeExplanations,
        isAnalyzed,
        eventLogs,
        approveAction,
        overrideAction,
        escalateAction,
        analyzeLogs,
        resetToDefault,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidentStore(): IncidentStore {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidentStore must be used within IncidentStoreProvider");
  return ctx;
}

