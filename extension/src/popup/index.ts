import { DEFAULT_MODELS } from "@src/constants/models";
import { TranslationProvider } from "@src/types";
import {
  addModel,
  deleteModel,
  getModels,
  getSelectedModel,
  saveModels,
  setSelectedModel,
} from "@src/utils/modelStorage";

const modelsListEl = document.getElementById("models-list") as HTMLDivElement;
const modelCountEl = document.getElementById("model-count") as HTMLSpanElement;
const addModelForm = document.getElementById(
  "add-model-form",
) as HTMLFormElement;
const modelNameInput = document.getElementById(
  "model-name",
) as HTMLInputElement;
const modelProviderSelect = document.getElementById(
  "model-provider",
) as HTMLSelectElement;
const formMessageEl = document.getElementById(
  "form-message",
) as HTMLDivElement;

function showMessage(text: string, type: "error" | "success") {
  formMessageEl.textContent = text;
  formMessageEl.className = `form-message ${type}`;
  setTimeout(() => {
    if (formMessageEl.textContent === text) {
      formMessageEl.textContent = "";
      formMessageEl.className = "form-message";
    }
  }, 3000);
}

async function renderModels() {
  const models = await getModels();
  const selectedModel = await getSelectedModel();

  modelCountEl.textContent = String(models.length);
  modelsListEl.innerHTML = "";

  if (models.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty-models";
    emptyEl.innerHTML = `
      <span>No models configured.</span>
      <button type="button" class="btn-restore" id="btn-restore-defaults">Restore Defaults</button>
    `;
    modelsListEl.appendChild(emptyEl);

    const restoreBtn = emptyEl.querySelector(
      "#btn-restore-defaults",
    ) as HTMLButtonElement;
    restoreBtn.addEventListener("click", async () => {
      await saveModels(DEFAULT_MODELS);
      await setSelectedModel(DEFAULT_MODELS[0]);
      await renderModels();
    });
    return;
  }

  models.forEach((model, index) => {
    const isSelected =
      selectedModel &&
      selectedModel.name === model.name &&
      selectedModel.provider === model.provider;

    const card = document.createElement("div");
    card.className = `model-card ${isSelected ? "active" : ""}`;

    const info = document.createElement("div");
    info.className = "model-info";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "selected-model";
    radio.className = "model-radio";
    radio.checked = Boolean(isSelected);

    const details = document.createElement("div");
    details.className = "model-details";

    const nameEl = document.createElement("span");
    nameEl.className = "model-name";
    nameEl.textContent = model.name;
    nameEl.title = model.name;

    const tags = document.createElement("div");
    tags.className = "model-tags";

    const providerBadge = document.createElement("span");
    providerBadge.className = `provider-badge provider-${model.provider}`;
    providerBadge.textContent = model.provider;
    tags.appendChild(providerBadge);

    if (isSelected) {
      const activeBadge = document.createElement("span");
      activeBadge.className = "active-badge";
      activeBadge.textContent = "Active";
      tags.appendChild(activeBadge);
    }

    details.appendChild(nameEl);
    details.appendChild(tags);

    info.appendChild(radio);
    info.appendChild(details);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.title = `Delete ${model.name}`;
    deleteBtn.setAttribute("aria-label", `Delete ${model.name}`);
    deleteBtn.innerHTML = `✕`;

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteModel(index);
      await renderModels();
    });

    card.addEventListener("click", async () => {
      await setSelectedModel(model);
      await renderModels();
    });

    radio.addEventListener("click", async (e) => {
      e.stopPropagation();
      await setSelectedModel(model);
      await renderModels();
    });

    card.appendChild(info);
    card.appendChild(deleteBtn);
    modelsListEl.appendChild(card);
  });
}

addModelForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = modelNameInput.value.trim();
  const provider = modelProviderSelect.value as TranslationProvider;

  if (!name) {
    showMessage("Please enter a model name", "error");
    return;
  }

  try {
    await addModel({ name, provider });
    modelNameInput.value = "";
    showMessage("Model created successfully!", "success");
    await renderModels();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add model";
    showMessage(message, "error");
  }
});

// Initial render
renderModels();
