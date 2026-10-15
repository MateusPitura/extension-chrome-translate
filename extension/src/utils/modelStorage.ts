import { AIModel } from "@src/types";
import { DEFAULT_MODELS } from "@src/constants/models";

export const STORAGE_KEY_MODELS = "translation_models";
export const STORAGE_KEY_SELECTED = "selected_translation_model";

export async function getModels(): Promise<AIModel[]> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve(DEFAULT_MODELS);
      return;
    }

    chrome.storage.local.get([STORAGE_KEY_MODELS], (result) => {
      if (chrome.runtime.lastError) {
        resolve(DEFAULT_MODELS);
        return;
      }
      const stored = result?.[STORAGE_KEY_MODELS];
      if (Array.isArray(stored)) {
        resolve(stored);
      } else {
        chrome.storage.local.set({ [STORAGE_KEY_MODELS]: DEFAULT_MODELS });
        resolve(DEFAULT_MODELS);
      }
    });
  });
}

export async function saveModels(models: AIModel[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      reject(new Error("chrome.storage.local is not available"));
      return;
    }

    chrome.storage.local.set({ [STORAGE_KEY_MODELS]: models }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getSelectedModel(): Promise<AIModel> {
  const models = await getModels();
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve(models[0] || DEFAULT_MODELS[0]);
      return;
    }

    chrome.storage.local.get([STORAGE_KEY_SELECTED], (result) => {
      const selected = result?.[STORAGE_KEY_SELECTED] as AIModel | undefined;
      if (
        selected &&
        models.some(
          (m) => m.name === selected.name && m.provider === selected.provider,
        )
      ) {
        resolve(selected);
      } else {
        const fallback = models[0] || DEFAULT_MODELS[0];
        if (models.length > 0) {
          chrome.storage.local.set({ [STORAGE_KEY_SELECTED]: fallback });
        }
        resolve(fallback);
      }
    });
  });
}

export async function setSelectedModel(model: AIModel): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      reject(new Error("chrome.storage.local is not available"));
      return;
    }

    chrome.storage.local.set({ [STORAGE_KEY_SELECTED]: model }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function addModel(newModel: AIModel): Promise<AIModel[]> {
  const models = await getModels();
  const exists = models.some(
    (m) => m.name.trim() === newModel.name.trim() && m.provider === newModel.provider,
  );
  if (exists) {
    throw new Error("Model with this name and provider already exists");
  }
  const updated = [...models, { name: newModel.name.trim(), provider: newModel.provider }];
  await saveModels(updated);
  return updated;
}

export async function deleteModel(index: number): Promise<AIModel[]> {
  const models = await getModels();
  const selected = await getSelectedModel();
  const modelToDelete = models[index];
  const updated = models.filter((_, i) => i !== index);
  await saveModels(updated);

  if (
    modelToDelete &&
    selected.name === modelToDelete.name &&
    selected.provider === modelToDelete.provider
  ) {
    const nextSelected = updated[0] || DEFAULT_MODELS[0];
    await setSelectedModel(nextSelected);
  }

  return updated;
}
