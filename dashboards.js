// ---------------------------------------------
// KLP DASHBOARD (UPDATED WITH MIRRORED SUMMARY)
// ---------------------------------------------

let paradoxSummaryChartInstance = null;
let paradoxCharts = [];

// ---------------------------------------------
// MAIN ENTRY POINT
// ---------------------------------------------
window.addEventListener("load", () => {
    setTimeout(() => {
        initializeDashboard();
    }, 80);
});

// ---------------------------------------------
// INITIALIZE DASHBOARD
// ---------------------------------------------
function initializeDashboard() {
    const stored = localStorage.getItem("klp_result");
    if (!stored) {
        console.error("No stored assessment result found.");
        return;
    }

    const data = JSON.parse(stored);

    // Archetype title card
    document.getElementById("archetype").innerText = data.archetype;

    // Textual sections
    buildParadoxSummary(data);
    buildLeadershipOverview(data);
    buildNarrativeSections(data);

    // New visual summary chart (replaces radar)
    buildParadoxSummaryChart(data);

    // Existing mini paradox charts
    buildParadoxCharts(data);
}

// ---------------------------------------------
// PARADOX SUMMARY (TEXT)
// ---------------------------------------------
function buildParadoxSummary(data) {
    const deltas = data.scores;

    const paradoxNames = {
        A: "Strategic Intent vs Technology Enthusiasm",
        B: "Enterprise Scale vs Local Innovation",
        C: "People & Culture vs Platforms & Architecture",
        D: "Automation Efficiency vs Service Redesign",
        E: "Innovation Speed vs Risk, Security & Trust"
    };

    const sorted = Object.entries(deltas).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
    const mostAligned = sorted[0][0];
    const mostStretched = sorted[sorted.length - 1][0];

    document.getElementById("summary-most-aligned").innerText =
        `Most aligned paradox: ${paradoxNames[mostAligned]}`;

    document.getElementById("summary-most-stretched").innerText =
        `Most stretched paradox: ${paradoxNames[mostStretched]}`;

    document.getElementById("summary-overall").innerText =
        `Overall balance score: ${data.archetype}`;

    document.getElementById("summary-interpretation").innerText =
        data.narrative.summary;
}

// ---------------------------------------------
// LEADERSHIP OVERVIEW (TEXT)
// ---------------------------------------------
function buildLeadershipOverview(data) {
    const deltas = data.scores;

    const avgDelta =
        (Math.abs(deltas.A) +
         Math.abs(deltas.B) +
         Math.abs(deltas.C) +
         Math.abs(deltas.D) +
         Math.abs(deltas.E)) / 5;

    let balanceLabel = "";
    if (avgDelta < 2) balanceLabel = "Highly Balanced Profile";
    else if (avgDelta < 4) balanceLabel = "Moderately Balanced Profile";
    else balanceLabel = "Strong Pole Preferences";

    document.getElementById("overview-archetype").innerText =
        `Archetype: ${data.archetype}`;

    document.getElementById("overview-balance").innerText =
        `Overall Balance: ${balanceLabel}`;

    document.getElementById("overview-strength").innerText =
        `Primary Leadership Strength: ${data.narrative.strengths}`;
}

// ---------------------------------------------
// NARRATIVE SECTIONS
// ---------------------------------------------
function buildNarrativeSections(data) {
    const n = data.narrative;

    // 1. Strategic Orientation
    document.getElementById("narrative-strategy").innerText =
        `${n.strengths}\n\n${n.development_areas}\n\n${n.leadership_style_indicators}`;

    // 2. People & Culture Impact
    document.getElementById("narrative-people").innerText =
        `${n.team_impact}\n\n${n.communication_profile}`;

    // 3. Decision & Execution Style
    document.getElementById("narrative-decision").innerText =
        `${n.decision_making_profile}\n\n${n.growth_opportunities}`;

    // 4. Transformation Approach
    document.getElementById("narrative-transformation").innerText =
        `${n.development_areas}`;

    // 5. Leadership Growth Path
    document.getElementById("narrative-growth").innerText =
        `${n.growth_opportunities}`;
}

// ---------------------------------------------
// PARADOX SUMMARY CHART (MIRRORED DIFFERENTIAL)
// ---------------------------------------------
function buildParadoxSummaryChart(data) {
    const ctx = document.getElementById("radarChart"); // reuse existing canvas

    if (!ctx) {
        console.error("Canvas with id 'radarChart' not found.");
        return;
    }

    if (paradoxSummaryChartInstance) {
        paradoxSummaryChartInstance.destroy();
    }

    const P = data.poles;
    const D = data.scores;

    const labels = [
        "Strategic Intent vs Technology Enthusiasm",
        "Enterprise Scale vs Local Innovation",
        "People & Culture vs Platforms & Architecture",
        "Automation Efficiency vs Service Redesign",
        "Innovation Speed vs Risk, Security & Trust"
    ];

    const pole1Scores = [
        P.SI_total,
        P.ES_total,
        P.PC_total,
        P.AE_total,
        P.IS_total
    ];

    const pole2Scores = [
        P.TE_total,
        P.LI_total,
        P.PA_total,
        P.SR_total,
        P.RT_total
    ];

    // Differentials already provided in data.scores (A–E)
    const diffs = [
        D.A,
        D.B,
        D.C,
        D.D,
        D.E
    ];

    // Custom plugin to draw labels (diff + pole scores) inside bars when possible
    const barLabelPlugin = {
        id: "barLabelPlugin",
        afterDatasetsDraw(chart, args, pluginOptions) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            ctx.save();
            ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            ctx.textBaseline = "middle";

            meta.data.forEach((bar, index) => {
                const value = diffs[index];
                const p1 = pole1Scores[index];
                const p2 = pole2Scores[index];

                const sign = value > 0 ? "+" : value < 0 ? "-" : "";
                const absVal = Math.abs(value);
                const labelText = `${sign}${absVal} (${p1} vs ${p2})`;

                const barCenterX = bar.x;
                const barCenterY = bar.y;
                const barWidth = bar.width; // signed width (left/right)

                const textWidth = ctx.measureText(labelText).width + 10; // padding

                // Decide if we can draw inside the bar
                const canFitInside = Math.abs(barWidth) > textWidth;

                if (canFitInside) {
                    // Inside bar: white text
                    ctx.fillStyle = "#FFFFFF";
                    const textX = barCenterX + (barWidth > 0 ? 0 : 0); // center on bar center
                    ctx.textAlign = "center";
                    ctx.fillText(labelText, textX, barCenterY);
                } else {
                    // Outside bar: dark text, just beyond bar end
                    ctx.fillStyle = "#333333";
                    ctx.textAlign = barWidth > 0 ? "left" : "right";
                    const offset = 6;
                    const textX = barCenterX + (barWidth > 0 ? barWidth + offset : barWidth - offset);
                    ctx.fillText(labelText, textX, barCenterY);
                }
            });

            ctx.restore();
        }
    };

    paradoxSummaryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Paradox Differential",
                data: diffs,
                backgroundColor: diffs.map(v =>
                    v > 0 ? "#4CAF50" : v < 0 ? "#FF9800" : "#9E9E9E"
                ),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 20
            },
            scales: {
                x: {
                    min: -10,
                    max: 10,
                    grid: {
                        color: "#e0e0e0"
                    },
                    ticks: {
                        stepSize: 2,
                        color: "#333333",
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    ticks: {
                        color: "#333333",
                        font: {
                            size: 12,
                            weight: "500"
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // legend handled in static HTML text
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const idx = context.dataIndex;
                            const diff = diffs[idx];
                            const p1 = pole1Scores[idx];
                            const p2 = pole2Scores[idx];
                            const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
                            const absVal = Math.abs(diff);
                            return [
                                `Differential: ${sign}${absVal}`,
                                `Pole 1: ${p1}/20`,
                                `Pole 2: ${p2}/20`
                            ];
                        }
                    }
                }
            },
            animation: {
                duration: 600
            }
        },
        plugins: [barLabelPlugin]
    });
}

// ---------------------------------------------
// MINI PARADOX CHARTS
// ---------------------------------------------
function buildParadoxCharts(data) {
    paradoxCharts.forEach(chart => chart.destroy());
    paradoxCharts = [];

    const P = data.poles;
    const D = data.scores;

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-1",
        "Strategic Intent", "Tech Enthusiasm",
        P.SI_total, P.TE_total, D.A
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-2",
        "Enterprise Scale", "Local Innovation",
        P.ES_total, P.LI_total, D.B
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-3",
        "People & Culture", "Platforms & Architecture",
        P.PC_total, P.PA_total, D.C
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-4",
        "Automation Efficiency", "Service Redesign",
        P.AE_total, P.SR_total, D.D
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-5",
        "Innovation Speed", "Risk & Security",
        P.IS_total, P.RT_total, D.E
    ));
}

// ---------------------------------------------
// CREATE A SINGLE PARADOX CHART
// ---------------------------------------------
function createParadoxChart(canvasId, pole1Label, pole2Label, pole1Score, pole2Score, delta) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                `${pole1Label} (${pole1Score}/20)`,
                `${pole2Label} (${pole2Score}/20)`,
                `Delta (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`
            ],
            datasets: [{
                data: [pole1Score, pole2Score, delta],
                backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: -10,
                    max: 20,
                    ticks: {
                        stepSize: 5,
                        color: "#333333",
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: "#e0e0e0"
                    }
                },
                y: {
                    ticks: {
                        color: "#333333",
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// ---------------------------------------------
// RE-RENDER CHARTS ON WINDOW RESIZE
// ---------------------------------------------
let resizeTimeout = null;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeDashboard();
    }, 200);
});
