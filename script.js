const depositAmounts = Array.from({ length: 20 }, (_, index) => 15000 + index * 10000);
const withdrawAmounts = [10000, 40000, 100000, 500000, 1000000, 5000000];

const state = {
  signedIn: false,
  screen: "authScreen",
  selectedDeposit: null,
  selectedWithdraw: null,
  balance: 325000,
  invested: 225000,
  profit: 100000,
  user: {
    name: "Godsfavour Ekette",
    email: "geypaluser@gmail.com",
    userId: "GYP-10486",
    plan: "VIP 4 Lease",
    joinDate: "12 Sep 2026",
  },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
};

const setScreen = (screenName) => {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenName);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.screen === screenName);
  });

  state.screen = screenName;

  if (screenName !== "authScreen") {
    document.getElementById("topbar").classList.remove("hidden");
  } else {
    document.getElementById("topbar").classList.add("hidden");
  }
};

const updateBalances = () => {
  document.getElementById("balanceDisplay").textContent = formatCurrency(state.balance);
  document.getElementById("investedDisplay").textContent = formatCurrency(state.invested);
  document.getElementById("profitDisplay").textContent = formatCurrency(state.profit);
};

const renderDepositOptions = () => {
  const grid = document.getElementById("depositAmountGrid");
  grid.innerHTML = "";

  depositAmounts.forEach((amount) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `amount-card ${state.selectedDeposit === amount ? "selected" : ""}`;
    btn.innerHTML = `
      <strong>${formatCurrency(amount)}</strong>
      <small>VIP ${depositAmounts.indexOf(amount) + 1}</small>
    `;

    btn.addEventListener("click", () => {
      state.selectedDeposit = amount;
      renderDepositOptions();
    });

    grid.appendChild(btn);
  });
};

const renderWithdrawOptions = () => {
  const grid = document.getElementById("withdrawAmountGrid");
  grid.innerHTML = "";

  withdrawAmounts.forEach((amount) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `amount-card ${state.selectedWithdraw === amount ? "selected" : ""}`;
    btn.innerHTML = `
      <strong>${formatCurrency(amount)}</strong>
      <small>Quick withdrawal</small>
    `;

    btn.addEventListener("click", () => {
      state.selectedWithdraw = amount;
      renderWithdrawOptions();
    });

    grid.appendChild(btn);
  });
};

const renderPlans = () => {
  const plansList = document.getElementById("plansList");
  plansList.innerHTML = "";

  depositAmounts.forEach((amount, index) => {
    const plan = document.createElement("button");
    plan.type = "button";
    plan.className = `plan-card ${index === 0 ? "selected" : ""}`;
    plan.innerHTML = `
      <div class="meta">
        <strong>VIP ${index + 1}</strong>
        <small>Principal: ${formatCurrency(amount)}</small>
        <small>Lease period: 10 days</small>
      </div>
      <div class="badge">+150% profit</div>
    `;

    plan.addEventListener("click", () => {
      state.selectedDeposit = amount;
      renderDepositOptions();
      setScreen("depositScreen");
    });

    plansList.appendChild(plan);
  });
};

const setProfileUI = () => {
  const profileName = document.getElementById("profileName");
  const profileId = document.getElementById("profileId");
  const profilePlan = document.getElementById("profilePlan");
  const profileDate = document.getElementById("profileDate");
  const profileEmail = document.getElementById("profileEmail");
  const profileAvatar = document.getElementById("profileAvatar");

  profileName.textContent = state.user.name;
  profileId.textContent = `User ID: ${state.user.userId}`;
  profilePlan.textContent = state.user.plan;
  profileDate.textContent = state.user.joinDate;
  profileEmail.textContent = state.user.email;
  profileAvatar.textContent = state.user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const handleAuthToggle = (tabName) => {
  const signupPanel = document.getElementById("signupPanel");
  const signinPanel = document.getElementById("signinPanel");
  const tabs = document.querySelectorAll(".toggle-btn");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authTab === tabName);
  });

  signupPanel.classList.toggle("active", tabName === "signup");
  signinPanel.classList.toggle("active", tabName === "signin");
};

const signUp = (event) => {
  event.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();

  if (!name || !email) return;

  state.user.name = name || state.user.name;
  state.user.email = email || state.user.email;
  state.user.plan = "VIP 4 Lease";
  state.signedIn = true;

  setProfileUI();
  updateBalances();
  setScreen("dashboardScreen");
  document.getElementById("signupForm").reset();
};

const signIn = (event) => {
  event.preventDefault();
  const email = document.getElementById("signinEmail").value.trim();

  if (!email) return;

  state.user.email = email || state.user.email;
  state.signedIn = true;

  setProfileUI();
  updateBalances();
  setScreen("dashboardScreen");
  document.getElementById("signinForm").reset();
};

const handleDepositProceed = () => {
  if (!state.selectedDeposit) {
    state.selectedDeposit = depositAmounts[0];
  }

  document.getElementById("paymentAmountDisplay").textContent = formatCurrency(state.selectedDeposit);
  setScreen("paymentScreen");
};

const handleConfirmDeposit = () => {
  if (!state.selectedDeposit) return;

  state.balance += state.selectedDeposit;
  state.invested += state.selectedDeposit;
  state.profit += Math.round(state.selectedDeposit * 0.32);
  state.user.plan = `VIP ${depositAmounts.indexOf(state.selectedDeposit) + 1} Lease`;

  updateBalances();
  setProfileUI();
  setScreen("dashboardScreen");
};

const handleWithdraw = (event) => {
  event.preventDefault();
  if (!state.selectedWithdraw) {
    state.selectedWithdraw = withdrawAmounts[0];
  }

  const name = document.getElementById("withdrawName").value.trim();
  const number = document.getElementById("withdrawNumber").value.trim();
  const bank = document.getElementById("withdrawBank").value.trim();

  if (!name || !number || !bank) return;

  if (state.balance < state.selectedWithdraw) {
    alert("Insufficient balance for this withdrawal.");
    return;
  }

  state.balance -= state.selectedWithdraw;
  state.profit = Math.max(0, state.profit - Math.round(state.selectedWithdraw * 0.12));

  updateBalances();
  document.getElementById("withdrawForm").reset();
  setScreen("dashboardScreen");
};

const bindEvents = () => {
  document.querySelectorAll(".toggle-btn").forEach((button) => {
    button.addEventListener("click", () => handleAuthToggle(button.dataset.authTab));
  });

  document.getElementById("signupForm").addEventListener("submit", signUp);
  document.getElementById("signinForm").addEventListener("submit", signIn);

  document.getElementById("proceedToPayBtn").addEventListener("click", handleDepositProceed);
  document.getElementById("confirmDepositBtn").addEventListener("click", handleConfirmDeposit);
  document.getElementById("withdrawForm").addEventListener("submit", handleWithdraw);

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setScreen(button.dataset.screen));
  });

  document.querySelectorAll(".back-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.back;
      if (target === "dashboard") {
        setScreen("dashboardScreen");
      } else if (target === "deposit") {
        setScreen("depositScreen");
      }
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.signedIn = false;
    setScreen("authScreen");
  });

  document.getElementById("refreshBalanceBtn").addEventListener("click", () => {
    updateBalances();
  });
};

const initialize = () => {
  bindEvents();
  renderDepositOptions();
  renderWithdrawOptions();
  renderPlans();
  setProfileUI();
  updateBalances();
  setScreen("authScreen");
};

initialize();






