const users = {
  "admin": { password: "admin123", role: "Admin" },
  "guest": { password: "guest123", role: "Guest" }
};

let currentUser = null;

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (users[username] && users[username].password === password) {
    currentUser = username;
    document.querySelector(".login-container").style.display = "none";
    document.querySelector(".app").style.display = "block";
    document.getElementById("userRole").innerText = users[username].role;
    updateSummary();
    updateList();
    updateChart();
  } else {
    document.getElementById("loginMessage").innerText = "Invalid credentials.";
  }
});

document.getElementById("entryForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;
  const dateTime = new Date().toISOString();
  const transactionId = "TRX" + Math.floor(100000 + Math.random() * 900000);

  const entry = { amount, type, description, dateTime, transactionId, user: currentUser };
  let entries = JSON.parse(localStorage.getItem("entries")) || [];
  entries.push(entry);
  localStorage.setItem("entries", JSON.stringify(entries));

  updateSummary();
  updateList();
  updateChart();
  this.reset();
});

function filterEntries() {
  const all = JSON.parse(localStorage.getItem("entries")) || [];
  return all.filter(e => {
    return users[currentUser].role === "Admin" || e.user === currentUser;
  });
}

function updateSummary() {
  const entries = filterEntries();
  const income = entries.filter(e => e.type === "Income").reduce((sum, e) => sum + e.amount, 0);
  const expense = entries.filter(e => e.type === "Expense").reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("totalIncome").innerText = income;
  document.getElementById("totalExpense").innerText = expense;
  document.getElementById("balance").innerText = income - expense;
}

function updateList() {
  const entries = filterEntries();
  const list = document.getElementById("entryList");
  const filterDate = document.getElementById("filterDate").value;
  list.innerHTML = "";
  entries.filter(e => {
    return !filterDate || e.dateTime.startsWith(filterDate);
  }).forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.type}: KES ${e.amount} - ${e.description} [${new Date(e.dateTime).toLocaleString()} | ${e.transactionId}]`;
    list.appendChild(li);
  });
}

function updateChart() {
  const entries = filterEntries();
  const income = entries.filter(e => e.type === "Income").reduce((sum, e) => sum + e.amount, 0);
  const expense = entries.filter(e => e.type === "Expense").reduce((sum, e) => sum + e.amount, 0);
  const ctx = document.getElementById("financeChart").getContext("2d");
  if (window.financeChart) window.financeChart.destroy();
  window.financeChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    },
    options: {
      responsive: true
    }
  });
}

function exportCSV() {
  const entries = filterEntries();
  let csv = "Type,Amount,Description,DateTime,TransactionID,User\n";
  entries.forEach(e => {
    csv += `${e.type},${e.amount},${e.description},${e.dateTime},${e.transactionId},${e.user}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finance_data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.getElementById("filterDate").addEventListener("change", updateList);
