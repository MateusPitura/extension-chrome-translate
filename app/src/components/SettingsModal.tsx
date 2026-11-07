import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../constants/theme";
import type { AIModel, ModelPurpose, TranslationProvider } from "../types";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  apiKey: string;
  onUpdateApiKey: (key: string) => void;
  workerApiKey: string;
  onUpdateWorkerApiKey: (key: string) => void;
  models: AIModel[];
  transcribeModels: AIModel[];
  selectedModel: AIModel;
  selectedTranscribeModel: AIModel;
  onSelectModel: (purpose: ModelPurpose, model: AIModel) => void;
  onAddModel: (purpose: ModelPurpose, model: AIModel) => Promise<boolean>;
  onUpdateModel: (purpose: ModelPurpose, index: number, model: AIModel) => Promise<boolean>;
  onDeleteModel: (purpose: ModelPurpose, index: number) => void;
}

export default function SettingsModal({
  visible,
  onClose,
  apiKey,
  onUpdateApiKey,
  workerApiKey,
  onUpdateWorkerApiKey,
  models,
  transcribeModels,
  selectedModel,
  selectedTranscribeModel,
  onSelectModel,
  onAddModel,
  onUpdateModel,
  onDeleteModel,
}: SettingsModalProps) {
  const [modelName, setModelName] = useState("");
  const [modelProvider, setModelProvider] =
    useState<TranslationProvider>("gemini");
  const [modelPurpose, setModelPurpose] = useState<ModelPurpose>("translate");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => {
    setModelName("");
    setModelProvider("gemini");
    setModelPurpose("translate");
    setEditingIndex(null);
  };

  const handleStartEdit = (purpose: ModelPurpose, index: number) => {
    const target = (purpose === "translate" ? models : transcribeModels)[index];
    if (!target) return;
    setEditingIndex(index);
    setModelName(target.name);
    setModelProvider(target.provider);
    setModelPurpose(purpose);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSaveModel = async () => {
    if (editingIndex !== null) {
      const ok = await onUpdateModel(modelPurpose, editingIndex, {
        name: modelName,
        provider: modelProvider,
      });
      if (ok) resetForm();
    } else {
      const ok = await onAddModel(modelPurpose, {
        name: modelName,
        provider: modelProvider,
      });
      if (ok) resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Text style={styles.closeButton}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Models CRUD Section */}
            <View style={styles.section}>
              {(["translate", "transcribe"] as const).map((purpose) => {
                const list = purpose === "translate" ? models : transcribeModels;
                const selected = purpose === "translate" ? selectedModel : selectedTranscribeModel;
                return <View key={purpose} style={styles.modelSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>{purpose === "translate" ? "TRANSLATE MODELS" : "TRANSCRIBE MODELS"}</Text>
              </View>

              <View style={styles.modelList}>
                {list.map((model, index) => {
                  const isActive = selected.name === model.name && selected.provider === model.provider;
                  return (
                    <View
                      key={`${model.name}-${index}`}
                      style={[
                        styles.modelItem,
                        isActive && styles.modelItemActive,
                      ]}
                    >
                      <Pressable
                        style={styles.modelInfo}
                        onPress={() => onSelectModel(purpose, model)}
                      >
                        <View style={styles.nameRow}>
                          <Text
                            style={[
                              styles.radio,
                              isActive && styles.radioActive,
                            ]}
                          >
                            {isActive ? "●" : "○"}
                          </Text>
                          <Text
                            style={[
                              styles.modelName,
                              isActive && styles.modelNameActive,
                            ]}
                            numberOfLines={1}
                          >
                            {model.name}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            model.provider === "gemini"
                              ? styles.badgeGemini
                              : styles.badgeWorker,
                          ]}
                        >
                          <Text style={styles.badgeText}>{model.provider}</Text>
                        </View>
                      </Pressable>

                      <View style={styles.actions}>
                        <Pressable
                          hitSlop={8}
                          onPress={() => handleStartEdit(purpose, index)}
                          style={styles.actionButton}
                        >
                          <Text style={styles.editAction}>Edit</Text>
                        </Pressable>
                        <Pressable
                          hitSlop={8}
                          onPress={() => onDeleteModel(purpose, index)}
                          style={styles.actionButton}
                        >
                          <Text style={styles.deleteAction}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
              </View>;
              })}

              {/* Add / Edit Form */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingIndex !== null ? `Edit ${modelPurpose} model` : `Add ${modelPurpose} model`}
                </Text>

                {editingIndex === null && <View style={styles.providerRow}>
                  <View style={styles.providerButtons}>
                    {(["translate", "transcribe"] as const).map((purpose) => <Pressable key={purpose} style={[styles.providerButton, modelPurpose === purpose && styles.providerButtonActive]} onPress={() => setModelPurpose(purpose)}>
                      <Text style={[styles.providerButtonText, modelPurpose === purpose && styles.providerButtonTextActive]}>{purpose}</Text>
                    </Pressable>)}
                  </View>
                </View>}

                <TextInput
                  style={styles.input}
                  value={modelName}
                  onChangeText={setModelName}
                  placeholder="Model name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.providerRow}>
                  <View style={styles.providerButtons}>
                    <Pressable
                      style={[
                        styles.providerButton,
                        modelProvider === "gemini" &&
                          styles.providerButtonActive,
                      ]}
                      onPress={() => setModelProvider("gemini")}
                    >
                      <Text
                        style={[
                          styles.providerButtonText,
                          modelProvider === "gemini" &&
                            styles.providerButtonTextActive,
                        ]}
                      >
                        gemini
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.providerButton,
                        modelProvider === "worker" &&
                          styles.providerButtonActive,
                      ]}
                      onPress={() => setModelProvider("worker")}
                    >
                      <Text
                        style={[
                          styles.providerButtonText,
                          modelProvider === "worker" &&
                            styles.providerButtonTextActive,
                        ]}
                      >
                        worker
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.formActionsRow}>
                  {editingIndex !== null && (
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSaveModel}
                  >
                    <Text style={styles.submitButtonText}>
                      {editingIndex !== null ? "Save" : `Add ${modelPurpose} model`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

             {/* API Key Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>GEMINI API KEY</Text>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={onUpdateApiKey}
                placeholder="Insert Gemini API Key"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.sectionLabel}>WORKER API KEY</Text>
              <TextInput
                style={styles.input}
                value={workerApiKey}
                onChangeText={onUpdateWorkerApiKey}
                placeholder="Insert Worker API Key"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.theirs,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    color: colors.translation,
    fontSize: 14,
    fontWeight: "600",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  hintText: {
    color: colors.muted,
    fontSize: 11,
  },
  input: {
    backgroundColor: colors.theirs,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modelList: {
    marginBottom: 12,
  },
  modelSection: {
    marginBottom: 10,
  },
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.theirs,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modelItemActive: {
    borderColor: colors.translation,
    backgroundColor: "#252B35",
  },
  modelInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radio: {
    color: colors.muted,
    fontSize: 14,
    marginRight: 6,
  },
  radioActive: {
    color: colors.translation,
  },
  modelName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  modelNameActive: {
    color: colors.translationText,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 18,
  },
  badgeGemini: {
    backgroundColor: "#2B4C7E",
  },
  badgeWorker: {
    backgroundColor: "#7E542B",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  editAction: {
    color: colors.translation,
    fontSize: 12,
    fontWeight: "600",
  },
  deleteAction: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  formTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  providerLabel: {
    color: colors.muted,
    fontSize: 13,
    marginRight: 10,
  },
  providerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  providerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.theirs,
  },
  providerButtonActive: {
    backgroundColor: colors.translation,
  },
  providerButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  providerButtonTextActive: {
    color: colors.background,
  },
  formActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: colors.theirs,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.translation,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
});
