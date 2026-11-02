
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

// YOUR DAMMY LAW SUPABASE CONNECTION
const SUPABASE_URL = "https://eumwjtfcodcocextnedx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_OT1em8jqN_65QYjZbnhV0g_zSJOnZyE';

// Connect to Supabase
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Login elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

// Administrator login
loginForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginButton.disabled = true;
  loginButton.textContent = "SIGNING IN...";
  loginMessage.textContent = "Checking your details...";
  loginMessage.style.color = "#d6ae57";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    loginMessage.textContent =
      "Login successful! Your administrator account is connected.";

    loginMessage.style.color = "#65d68a";

        loginButton.textContent = "SIGNED IN";

    window.location.replace("dashboard.html");

  } catch (error) {
    loginMessage.textContent =
      error.message || "Login failed. Please try again.";

    loginMessage.style.color = "#ff7070";

    loginButton.disabled = false;
    loginButton.textContent = "SIGN IN";
  }
});
