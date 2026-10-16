
const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transaction-list");

let transactions = [];

// Income and expense categories
const categories = {
    income: ["Salary", "Freelance", "Business", "Gift", "Other Income"],
    expense: [
        "Food & Dining",
        "Travel",
        "Medical",
        "Household",
        "Shopping",
        "Education",
        "Entertainment",
        "Bills & Utilities",
        "Other"
    ]
};

// Change category options based on transaction type
function updateCategories() {
    const selectedType = typeInput.value;

    categoryInput.replaceChildren();

    categories[selectedType].forEach(function(category) {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryInput.appendChild(option);
    });
}

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });

    balanceElement.textContent =
        formatMoney(totalIncome - totalExpenses);

    incomeElement.textContent = formatMoney(totalIncome);
    expensesElement.textContent = formatMoney(totalExpenses);
}

function displayTransactions() {
    transactionList.replaceChildren();

    if (transactions.length === 0) {
        const message = document.createElement("p");

        message.textContent =
            "No transactions yet. Add your first transaction!";

        message.className = "empty-message";
        transactionList.appendChild(message);

        return;
    }

    transactions.forEach(function(transaction) {
        const item = document.createElement("div");
        item.className = "transaction-item";

        const details = document.createElement("div");
        details.className = "transaction-details";

        const title = document.createElement("h3");
        title.textContent = transaction.description;

        const category = document.createElement("p");
        category.textContent = "Category: " + transaction.category;

        const date = document.createElement("p");
        date.textContent = "Date: " + transaction.date;

        const type = document.createElement("p");
        type.textContent =
            transaction.type === "income" ? "Income" : "Expense";

        details.append(title, category, date, type);

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const amount = document.createElement("span");
        amount.className = "transaction-amount";

        if (transaction.type === "income") {
            amount.textContent = "+" + formatMoney(transaction.amount);
            amount.classList.add("income-amount");
        } else {
            amount.textContent = "-" + formatMoney(transaction.amount);
            amount.classList.add("expense-amount");
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function() {
            transactions = transactions.filter(function(item) {
                return item.id !== transaction.id;
            });

            saveTransactions();
            updateSummary();
            displayTransactions();
        });

        actions.append(amount, deleteButton);
        item.append(details, actions);
        transactionList.appendChild(item);
    });
}

function saveTransactions() {
    localStorage.setItem(
        "expenseTrackerData",
        JSON.stringify(transactions)
    );
}

function loadTransactions() {
    try {
        const savedData = localStorage.getItem("expenseTrackerData");

        if (savedData) {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                transactions = parsedData.filter(function(item) {
                    return item &&
                        typeof item.id === "string" &&
                        typeof item.description === "string" &&
                        typeof item.amount === "number" &&
                        Number.isFinite(item.amount) &&
                        item.amount > 0 &&
                        ["income", "expense"].includes(item.type) &&
                        typeof item.category === "string" &&
                        typeof item.date === "string";
                });
            }
        }
    } catch (error) {
        console.log("Unable to load saved transactions.");
        transactions = [];
    }
}

function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Update categories whenever Income or Expense changes
typeInput.addEventListener("change", updateCategories);

// Add a new transaction
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (description === "" || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid description and amount.");
        return;
    }

    if (!date || date > getToday()) {
        alert("Please select a valid date.");
        return;
    }

    const transaction = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        description: description,
        amount: Math.round(amount * 100) / 100,
        type: type,
        category: category,
        date: date
    };

    transactions.push(transaction);

    saveTransactions();
    updateSummary();
    displayTransactions();

    form.reset();
    updateCategories();
    dateInput.value = getToday();
});

// Set up the application
dateInput.value = getToday();
dateInput.max = getToday();

updateCategories();
loadTransactions();
updateSummary();
displayTransactions();
