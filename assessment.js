/// ------------------------------------------------------------
// AUTO‑GENERATE RADIO BUTTONS FOR EACH QUESTION
// ------------------------------------------------------------
document.querySelectorAll(".options").forEach(group => {
    const name = group.getAttribute("data-name");

    for (let i = 1; i <= 5; i++) {
        const label = document.createElement("label");
        label.style.marginRight = "12px";

        label.innerHTML = `
            <input type="radio" name="${name}" value="${i}">
            ${i}
        `;

        group.appendChild(label);
    }
});

// ------------------------------------------------------------
// SUBMIT HANDLER
// ------------------------------------------------------------
document.getElementById("submitAssessment").addEventListener("click", () => {
    const answers = {};
    let missing = [];

    // Collect all answers
    document.querySelectorAll(".options").forEach(group => {
        const name = group.getAttribute("data-name");
        const selected = group.querySelector("input[type=radio]:checked");

        if (!selected) {
            missing.push(name);
        } else {
            answers[name] = parseInt(selected.value, 10);
        }
    });

    // Validation
    if (missing.length > 0) {
        alert("Please answer all questions before submitting.\nMissing: " + missing.join(", "));
        return;
    }

    // ------------------------------------------------------------
    // POST TO BACKEND
    // ------------------------------------------------------------
    fetch("https://xahive-backend-app.jollymeadow-e3d0425f.canadacentral.azurecontainerapps.io/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
    })
    .then(async res => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error("Server error: " + text);
        }
        return res.json();
    })
    .then(data => {
        // Save result for dashboard
        localStorage.setItem("klp_result", JSON.stringify(data));

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    })
    .catch(err => {
        console.error("Assessment submission error:", err);
        alert("Something went wrong submitting your assessment. Check console for details.");
    });
});
