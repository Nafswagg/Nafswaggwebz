let entries = [];

document.getElementById("entryForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;

  const entry = { amount, type, description };
  entries.push(entry);
  updateSummary();
  updateList();
  this.reset();
});

function updateSummary() {
  const income = entries.filter(e => e.type === "Income").reduce((sum, e) => sum + e.amount, 0);
  const expense = entries.filter(e => e.type === "Expense").reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("totalIncome").innerText = income;
  document.getElementById("totalExpense").innerText = expense;
  document.getElementById("balance").innerText = income - expense;
}

function updateList() {
  const list = document.getElementById("entryList");
  list.innerHTML = "";
  entries.forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.type}: KES ${e.amount} - ${e.description}`;
    list.appendChild(li);
  });
}
