
const SUPABASE_URL = "https://eumwjtfcodcocextnedx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_OT1em8jqN_65QYjZbnhV0g_zSJOnZyE";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginButton.disabled = true;
  loginButton.textContent = "SIGNING IN...";
  loginMessage.textContent = "Connecting to administrator account...";
  loginMessage.style.color = "#d6ae57";

  try {
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    loginMessage.textContent = "Login successful!";
    loginMessage.style.color = "#65d68a";

    window.location.replace("dashboard.html");

  } catch (error) {
    loginMessage.textContent =
      error.message || "Login failed. Please try again.";

    loginMessage.style.color = "#ff7070";

    loginButton.disabled = false;
    loginButton.textContent = "SIGN IN";
  }
});
