// HerPower — interactive front-end behavior
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }));

  $("#year").textContent = new Date().getFullYear();

  // Toast message helper
  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // Equality quiz
  const questions = [
    { q: "Gender equality means…", options: ["Women should have more rights than men.", "People of all genders have equal rights, responsibilities, and opportunities.", "Everyone must make the same life choices."], answer: 1, explain: "Equality means rights and opportunities should not depend on a person's gender." },
    { q: "Which action helps challenge a gender stereotype?", options: ["Assuming a job suits only one gender.", "Making fun of people who do not follow gender roles.", "Encouraging people to choose careers based on their interests and abilities."], answer: 2, explain: "Skills and interests—not gender—should guide someone's choices." },
    { q: "What is one way to support women's leadership?", options: ["Listen to women's ideas and consider them fairly.", "Interrupt women more often in meetings.", "Assume leadership is naturally a man's role."], answer: 0, explain: "Fair participation means women's ideas are heard and evaluated on their merits." },
    { q: "Why does unpaid care work matter in gender equality?", options: ["It has no impact on opportunity.", "Unequal care responsibilities can limit time for paid work, rest, and education.", "Only paid work contributes to society."], answer: 1, explain: "Care work is valuable, and sharing it fairly can create more equal opportunities." },
    { q: "Which Philippine law is known as the Magna Carta of Women?", options: ["Republic Act No. 9710", "Republic Act No. 9003", "Republic Act No. 10173"], answer: 0, explain: "Republic Act No. 9710 is the Magna Carta of Women." }
  ];
  let quizIndex = 0, quizScore = 0, quizAnswered = false;
  const quizArea = $("#quizArea"), quizResult = $("#quizResult"), quizNext = $("#quizNext");
  function renderQuestion() {
    const item = questions[quizIndex];
    quizAnswered = false;
    $("#quizProgressText").textContent = `Question ${quizIndex + 1} of ${questions.length}`;
    $("#quizProgressBar").style.width = `${((quizIndex + 1) / questions.length) * 100}%`;
    $("#quizQuestion").textContent = item.q;
    $("#quizFeedback").textContent = "";
    $("#quizFeedback").className = "quiz-feedback";
    $("#quizOptions").innerHTML = "";
    item.options.forEach((option, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener("click", () => chooseAnswer(i, button));
      $("#quizOptions").appendChild(button);
    });
    quizNext.disabled = true;
    quizNext.textContent = "Choose an answer first";
    quizNext.onclick = null;
  }
  function chooseAnswer(index, chosenButton) {
    if (quizAnswered) return;
    quizAnswered = true;
    const item = questions[quizIndex];
    const options = $$(".quiz-option", $("#quizOptions"));
    options.forEach((button, i) => {
      button.disabled = true;
      if (i === item.answer) button.classList.add("correct");
    });
    const feedback = $("#quizFeedback");
    if (index === item.answer) {
      quizScore++;
      feedback.textContent = `Correct! ${item.explain}`;
      feedback.classList.add("good");
    } else {
      chosenButton.classList.add("incorrect");
      feedback.textContent = `Not quite. ${item.explain}`;
      feedback.classList.add("bad");
    }
    quizNext.disabled = false;
    quizNext.textContent = quizIndex === questions.length - 1 ? "See my results" : "Next question →";
    quizNext.onclick = () => {
      if (quizIndex < questions.length - 1) {
        quizIndex++;
        renderQuestion();
      } else {
        showQuizResult();
      }
    };
  }
  function showQuizResult() {
    quizArea.classList.add("hidden");
    quizResult.classList.remove("hidden");
    const percent = Math.round((quizScore / questions.length) * 100);
    let message = percent === 100 ? "Amazing! You're an equality champion." : percent >= 60 ? "Great work! Keep learning and speaking up for equality." : "Good start! Review the sections above and try again.";
    quizResult.innerHTML = `<div class="result-score">${quizScore}/${questions.length}</div><h4>${percent}% correct</h4><p>${message}</p><button class="button button-primary" id="restartQuiz">Try again ↻</button>`;
    $("#restartQuiz").addEventListener("click", () => {
      quizIndex = 0; quizScore = 0;
      quizResult.classList.add("hidden"); quizArea.classList.remove("hidden");
      renderQuestion();
    });
  }
  renderQuestion();

  // Pledge generator and copy
  $("#makePledge").addEventListener("click", () => {
    const chosen = $$(".pledge-options input:checked").map(input => input.value);
    if (!chosen.length) {
      showToast("Choose at least one commitment to create your pledge.");
      $(".pledge-options input").focus();
      return;
    }
    const pledge = "My HerPower Pledge\nI commit to promoting gender equality in my everyday actions:\n" + chosen.map(item => "• " + item).join("\n") + "\nTogether, we can build a more respectful and inclusive community.";
    $("#pledgeText").textContent = pledge;
    $("#pledgeOutput").classList.remove("hidden");
    $("#copyStatus").textContent = "";
  });
  $("#copyPledge").addEventListener("click", async () => {
    const text = $("#pledgeText").textContent;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyStatus").textContent = "Copied!";
    } catch {
      const area = document.createElement("textarea");
      area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select();
      const success = document.execCommand("copy"); area.remove();
      $("#copyStatus").textContent = success ? "Copied!" : "Select and copy the text manually.";
    }
  });

  // Stereotype challenge
  const stereotypes = [
    { statement: "“Leadership is more suited to men.”", explanation: "Leadership depends on skills, experience, integrity, and support—not gender. Women can and do lead in every field." },
    { statement: "“Some careers are only for men or only for women.”", explanation: "People should be able to explore careers based on their interests, talents, and goals without gender-based limits." },
    { statement: "“Women should handle most of the housework.”", explanation: "Household and care responsibilities are shared responsibilities. Fairly sharing the work supports everyone's well-being and opportunities." },
    { statement: "“Being emotional means a woman cannot make good decisions.”", explanation: "Emotional expression does not determine decision-making ability. Good decisions depend on information, judgment, and experience." },
    { statement: "“A woman’s main role is to become a wife or mother.”", explanation: "Women have different aspirations and life paths. Every person deserves respect and the freedom to make personal choices." }
  ];
  let stereoIndex = 0;
  function renderStereo() {
    $("#stereoStatement").textContent = stereotypes[stereoIndex].statement;
    $("#stereoExplanation").textContent = stereotypes[stereoIndex].explanation;
    $("#stereoAnswer").classList.add("hidden");
    $("#revealStereo").textContent = "Challenge this idea";
    $("#stereoDots").innerHTML = stereotypes.map((_, i) => `<span class="${i === stereoIndex ? "active" : ""}" aria-hidden="true"></span>`).join("");
  }
  $("#revealStereo").addEventListener("click", () => {
    const answer = $("#stereoAnswer");
    const nowHidden = answer.classList.toggle("hidden");
    $("#revealStereo").textContent = nowHidden ? "Challenge this idea" : "Hide explanation";
  });
  $("#nextStereo").addEventListener("click", () => {
    stereoIndex = (stereoIndex + 1) % stereotypes.length;
    renderStereo();
  });
  renderStereo();

  // Action checklist counter and progress
  const tasks = $$("#actionChecklist input");
  function updateTasks() {
    const complete = tasks.filter(task => task.checked).length;
    $("#taskCount").textContent = `${complete} of ${tasks.length} completed`;
    $("#taskProgress").style.width = `${(complete / tasks.length) * 100}%`;
  }
  tasks.forEach(task => task.addEventListener("change", updateTasks));
  $("#resetChecklist").addEventListener("click", () => {
    tasks.forEach(task => task.checked = false);
    updateTasks();
    showToast("Your action checklist has been reset.");
  });
  updateTasks();

  // Share API with copy-link fallback
  $("#shareButton").addEventListener("click", async () => {
    const shareData = { title: "HerPower — Empowering Women", text: "Explore HerPower and take action for gender equality.", url: window.location.href.split("#")[0] };
    const status = $("#shareStatus");
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        status.textContent = "Thanks for sharing!";
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        status.textContent = "Website link copied!";
      } else {
        window.prompt("Copy this website link:", shareData.url);
        status.textContent = "Copy the link to share it.";
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareData.url);
          status.textContent = "Website link copied!";
        } catch {
          window.prompt("Copy this website link:", shareData.url);
          status.textContent = "Copy the link to share it.";
        }
      }
    }
    setTimeout(() => { status.textContent = ""; }, 3500);
  });

  // Front-end-only feedback form validation; nothing is transmitted or stored
  $("#feedbackForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#feedbackName").value.trim();
    const email = $("#feedbackEmail").value.trim();
    const message = $("#feedbackMessage").value.trim();
    const status = $("#formStatus");
    status.className = "form-status";
    if (!name || !email || !message) {
      status.textContent = "Please complete all required fields.";
      status.classList.add("error");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      status.textContent = "Please enter a valid email address.";
      status.classList.add("error");
      $("#feedbackEmail").focus();
      return;
    }
    if (message.length < 10) {
      status.textContent = "Please write a message with at least 10 characters.";
      status.classList.add("error");
      $("#feedbackMessage").focus();
      return;
    }
    status.textContent = "Form validated successfully. This demo does not send or store your message.";
    status.classList.add("success");
    showToast("Thank you for sharing your feedback!");
    $("#feedbackForm").reset();
  });
});
