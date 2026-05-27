import { Feather, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import { useIsTablet } from "@/hooks/useIsTablet";
import {
  confirmImport,
  fetchImportHistory,
  parseImport,
  type ColumnMappingDetail,
  type ImportHistoryItem,
  type ImportParseResult,
} from "@/services/cloudSync";

// ─── xlsx parsing (web + native) ──────────────────────────────────────────

async function parseSpreadsheet(
  uri: string,
  filename: string,
): Promise<Record<string, unknown>[]> {
  const XLSX = await import("xlsx");

  let data: ArrayBuffer;
  if (Platform.OS === "web") {
    const res = await fetch(uri);
    data = await res.arrayBuffer();
  } else {
    const FileSystem = await import("expo-file-system");
    const b64 = await FileSystem.default.readAsStringAsync(uri, {
      encoding: "base64",
    });
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    data = bytes.buffer;
  }

  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: false,
  });
  return rows;
}

// ─── Confidence badge config ───────────────────────────────────────────────

function getConfidenceConfig(method: ColumnMappingDetail["method"]) {
  switch (method) {
    case "exact":
      return {
        label: "Exact",
        color: "#22C55E",
        icon: "check-circle" as const,
      };
    case "override":
      return { label: "Custom", color: "#22C55E", icon: "edit-2" as const };
    case "alias":
      return { label: "Matched", color: "#22C55E", icon: "check" as const };
    case "smart":
      return { label: "AI", color: "#EAB308", icon: "cpu" as const };
    case "fuzzy":
      return { label: "Fuzzy", color: "#F59E0B", icon: "zap" as const };
    default:
      return { label: "—", color: "#6B7280", icon: "minus" as const };
  }
}

// ─── ColumnMappingEditor ───────────────────────────────────────────────────

function ColumnMappingEditor({
  details,
  availableHeaders,
  onOverride,
  isRemapping,
}: {
  details: ColumnMappingDetail[];
  availableHeaders: string[];
  onOverride: (canonical: string, header: string | null) => void;
  isRemapping: boolean;
}) {
  const colors = useColors();
  const [pickerCanonical, setPickerCanonical] = useState<string | null>(null);

  const pickerDetail =
    details.find((d) => d.canonical === pickerCanonical) ?? null;
  const mappedCount = details.filter((d) => d.header !== null).length;
  const aiCount = details.filter(
    (d) => d.method === "smart" || d.method === "fuzzy",
  ).length;
  const overrideCount = details.filter((d) => d.method === "override").length;

  if (details.length === 0) return null;

  return (
    <View
      style={[
        ms.card,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={ms.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[ms.cardTitle, { color: colors.mutedForeground }]}>
            Column mapping
          </Text>
          <View
            style={[ms.aiBadge, { backgroundColor: colors.primary + "20" }]}
          >
            <Feather name="cpu" size={9} color={colors.primary} />
            <Text style={[ms.aiBadgeText, { color: colors.primary }]}>
              Smart
            </Text>
          </View>
          {overrideCount > 0 && (
            <View style={[ms.aiBadge, { backgroundColor: "#22C55E20" }]}>
              <Feather name="edit-2" size={9} color="#22C55E" />
              <Text style={[ms.aiBadgeText, { color: "#22C55E" }]}>
                {overrideCount} custom
              </Text>
            </View>
          )}
        </View>
        {isRemapping ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={[ms.summaryText, { color: colors.mutedForeground }]}>
            {mappedCount}/{details.length}
            {aiCount > 0 ? ` · ${aiCount} AI` : ""}
          </Text>
        )}
      </View>

      {/* Legend */}
      <View style={[ms.legend, { borderBottomColor: colors.border }]}>
        {(
          [
            { label: "Exact match", color: "#22C55E" },
            { label: "AI matched", color: "#EAB308" },
            { label: "Fuzzy", color: "#F59E0B" },
            { label: "Not found", color: "#6B7280" },
          ] as const
        ).map((item) => (
          <View key={item.label} style={ms.legendItem}>
            <View style={[ms.legendDot, { backgroundColor: item.color }]} />
            <Text style={[ms.legendText, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Mapping rows */}
      {details.map((d, i) => {
        const cfg = getConfidenceConfig(d.method);
        const isLast = i === details.length - 1;
        return (
          <Pressable
            key={d.canonical}
            style={[
              ms.row,
              !isLast && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => setPickerCanonical(d.canonical)}
          >
            {/* Confidence dot */}
            <View
              style={[
                ms.dot,
                { backgroundColor: cfg.color + (d.header ? "FF" : "40") },
              ]}
            />

            {/* Field label */}
            <Text
              style={[
                ms.fieldLabel,
                {
                  color: d.header ? colors.foreground : colors.mutedForeground,
                  fontWeight: d.header ? "500" : "400",
                },
              ]}
            >
              {d.label}
            </Text>

            {/* Arrow */}
            <Feather
              name="arrow-right"
              size={11}
              color={d.header ? colors.primary : colors.mutedForeground}
              style={{ marginHorizontal: 8, opacity: d.header ? 1 : 0.4 }}
            />

            {/* Mapped header + badge */}
            <View style={ms.rowRight}>
              <Text
                style={[
                  ms.headerText,
                  {
                    color: d.header ? colors.primary : colors.mutedForeground,
                    fontStyle: d.header ? "normal" : "italic",
                    opacity: d.header ? 1 : 0.6,
                  },
                ]}
                numberOfLines={1}
              >
                {d.header ?? "Not detected"}
              </Text>
              <View
                style={[ms.confBadge, { backgroundColor: cfg.color + "20" }]}
              >
                <Feather name={cfg.icon} size={9} color={cfg.color} />
                <Text style={[ms.confBadgeText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={13}
                color={colors.mutedForeground}
                style={{ opacity: 0.5 }}
              />
            </View>
          </Pressable>
        );
      })}

      {/* Header picker bottom sheet modal */}
      <Modal
        visible={pickerCanonical !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerCanonical(null)}
      >
        <Pressable
          style={ms.modalOverlay}
          onPress={() => setPickerCanonical(null)}
        >
          <Pressable
            style={[ms.modalSheet, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[ms.modalHandle, { backgroundColor: colors.border }]}
            />

            <Text style={[ms.modalTitle, { color: colors.foreground }]}>
              Map "{pickerDetail?.label}"
            </Text>
            <Text style={[ms.modalSubtitle, { color: colors.mutedForeground }]}>
              Choose which spreadsheet column maps to this field
            </Text>

            {/* Current auto-suggestion */}
            {pickerDetail?.alternatives &&
              pickerDetail.alternatives.length > 0 && (
                <View
                  style={[
                    ms.suggestionsBox,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      ms.suggestionsTitle,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Other suggestions
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                  >
                    {pickerDetail.alternatives.map((alt) => (
                      <Pressable
                        key={alt.header}
                        style={[
                          ms.suggestionChip,
                          {
                            borderColor: colors.primary + "60",
                            backgroundColor: colors.primary + "10",
                          },
                        ]}
                        onPress={() => {
                          onOverride(pickerCanonical!, alt.header);
                          setPickerCanonical(null);
                        }}
                      >
                        <Text
                          style={[
                            ms.suggestionChipText,
                            { color: colors.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {alt.header}
                        </Text>
                        <Text
                          style={[
                            ms.suggestionScore,
                            { color: colors.primary },
                          ]}
                        >
                          {alt.score}%
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

            <ScrollView
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Not mapped option */}
              <Pressable
                style={[ms.pickerItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onOverride(pickerCanonical!, null);
                  setPickerCanonical(null);
                }}
              >
                <Text
                  style={[
                    ms.pickerItemText,
                    { color: colors.mutedForeground, fontStyle: "italic" },
                  ]}
                >
                  — Not mapped —
                </Text>
                {pickerDetail?.header === null && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </Pressable>

              {/* All spreadsheet headers */}
              {availableHeaders.map((h) => {
                const isSelected = pickerDetail?.header === h;
                return (
                  <Pressable
                    key={h}
                    style={[
                      ms.pickerItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primary + "12" },
                    ]}
                    onPress={() => {
                      onOverride(pickerCanonical!, h);
                      setPickerCanonical(null);
                    }}
                  >
                    <Text
                      style={[
                        ms.pickerItemText,
                        {
                          color: isSelected
                            ? colors.primary
                            : colors.foreground,
                          fontWeight: isSelected ? "700" : "400",
                        },
                      ]}
                    >
                      {h}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={[ms.modalCancel, { borderTopColor: colors.border }]}
              onPress={() => setPickerCanonical(null)}
            >
              <Text
                style={[ms.modalCancelText, { color: colors.mutedForeground }]}
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors = useColors();
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "#22C55E20", text: "#22C55E", label: "Completed" },
    processing: { bg: "#EAB308" + "20", text: "#EAB308", label: "Processing" },
    pending: { bg: "#F59E0B20", text: "#F59E0B", label: "Pending" },
    failed: {
      bg: colors.destructive + "20",
      text: colors.destructive,
      label: "Failed",
    },
  };
  const cfg = config[status] || config.pending;
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function HistoryRow({ item }: { item: ImportHistoryItem }) {
  const colors = useColors();
  const date = new Date(item.uploadedAt).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View
      style={[
        s.historyRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={s.historyRowLeft}>
        <Text
          style={[s.historyFileName, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {item.fileName}
        </Text>
        <Text style={[s.historyMeta, { color: colors.mutedForeground }]}>
          {date} · {item.uploadedBy} · {item.sourceSystem.replace("_", " ")}
        </Text>
        <View style={s.historyStats}>
          <Text style={[s.historyStatText, { color: "#22C55E" }]}>
            ✓ {item.importedRows} imported
          </Text>
          {item.failedRows > 0 && (
            <Text style={[s.historyStatText, { color: colors.destructive }]}>
              · ✗ {item.failedRows} failed
            </Text>
          )}
          <Text style={[s.historyStatText, { color: colors.mutedForeground }]}>
            · {item.totalRows} total
          </Text>
        </View>
      </View>
      <StatusBadge status={item.status} />
    </View>
  );
}

function ValidationTable({
  items,
  type,
}: {
  items: Array<{ row: number; field: string; message: string }>;
  type: "error" | "warning";
}) {
  const colors = useColors();
  const color = type === "error" ? colors.destructive : colors.warning;
  if (items.length === 0) return null;
  return (
    <View
      style={[
        s.validationTable,
        { borderColor: color + "40", backgroundColor: color + "10" },
      ]}
    >
      <Text style={[s.validationTitle, { color }]}>
        {type === "error" ? "⚠ Errors" : "⚑ Warnings"} ({items.length})
      </Text>
      {items.slice(0, 10).map((item, i) => (
        <View key={i} style={s.validationRow}>
          <Text style={[s.validationRow2, { color: colors.mutedForeground }]}>
            Row {item.row}
          </Text>
          <Text style={[s.validationMsg, { color: colors.foreground }]}>
            {item.message}
          </Text>
        </View>
      ))}
      {items.length > 10 && (
        <Text style={[s.validationMore, { color: colors.mutedForeground }]}>
          + {items.length - 10} more
        </Text>
      )}
    </View>
  );
}

function PreviewCard({
  row,
  index,
}: {
  row: Record<string, unknown>;
  index: number;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        s.previewCard,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      <Text style={[s.previewCardIdx, { color: colors.mutedForeground }]}>
        Row {index + 1}
      </Text>
      {Object.entries(row)
        .filter(([, v]) => v !== "" && v !== null && v !== undefined)
        .slice(0, 6)
        .map(([k, v]) => (
          <View key={k} style={s.previewField}>
            <Text
              style={[s.previewFieldKey, { color: colors.mutedForeground }]}
            >
              {k}
            </Text>
            <Text
              style={[s.previewFieldVal, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {String(v)}
            </Text>
          </View>
        ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────

type Step = "upload" | "review" | "importing" | "done";

export default function ImportEventsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  const { addFunction, currentStaffId, staff } = useKitchen();

  const currentStaff = staff.find((s) => s.id === currentStaffId);
  const uploadedBy = currentStaff?.name || "Kitchen Staff";

  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isRemapping, setIsRemapping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState("");
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(
    null,
  );
  const [columnOverrides, setColumnOverrides] = useState<
    Record<string, string>
  >({});
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");

  // All headers from the uploaded spreadsheet (for the picker)
  const availableHeaders = useMemo(
    () => (rawRows.length > 0 ? Object.keys(rawRows[0] ?? {}) : []),
    [rawRows],
  );

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDragging) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isDragging, pulseAnim]);

  useEffect(() => {
    fetchImportHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleFile = useCallback(
    async (uri: string, name: string) => {
      setIsLoading(true);
      setColumnOverrides({});
      try {
        const rows = await parseSpreadsheet(uri, name);
        if (rows.length === 0) {
          Alert.alert("Empty file", "No data rows found in the spreadsheet.");
          return;
        }
        setFilename(name);
        setRawRows(rows);
        const result = await parseImport({ rows, filename: name, uploadedBy });
        setParseResult(result);
        setStep("review");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        Alert.alert(
          "Parse error",
          err instanceof Error ? err.message : "Could not read file",
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    },
    [uploadedBy],
  );

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "text/comma-separated-values",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await handleFile(asset.uri, asset.name);
    } catch {
      Alert.alert("Error", "Could not open file picker");
    }
  }, [handleFile]);

  // Web drag-and-drop
  const handleWebDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      handleFile(url, file.name);
    },
    [handleFile],
  );

  // When the user manually overrides a column mapping → re-parse with the new overrides
  const handleMappingOverride = useCallback(
    async (canonical: string, header: string | null) => {
      const newOverrides: Record<string, string> = { ...columnOverrides };
      if (header === null) {
        delete newOverrides[canonical];
      } else {
        newOverrides[canonical] = header;
      }
      setColumnOverrides(newOverrides);

      if (!parseResult || rawRows.length === 0) return;
      setIsRemapping(true);
      try {
        const result = await parseImport({
          rows: rawRows,
          filename,
          uploadedBy,
          columnOverrides: newOverrides,
        });
        setParseResult(result);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Silently ignore re-parse errors — keep existing result
      } finally {
        setIsRemapping(false);
      }
    },
    [columnOverrides, parseResult, rawRows, filename, uploadedBy],
  );

  const handleConfirmImport = useCallback(async () => {
    if (!parseResult) return;
    setStep("importing");
    setIsLoading(true);
    try {
      const result = await confirmImport(
        parseResult.jobId,
        rawRows,
        uploadedBy,
      );

      const newHistory = await fetchImportHistory().catch(() => history);
      setHistory(newHistory);

      const { fetchCloudFunctions } = await import("@/services/cloudSync");
      const cloudFns = await fetchCloudFunctions();
      const importedIds = new Set(result.importedIds);
      for (const fn of cloudFns) {
        if (importedIds.has(fn.id)) {
          addFunction(fn);
        }
      }

      setImportResult({ imported: result.imported, failed: result.failed });
      setStep("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(
        "Import error",
        err instanceof Error ? err.message : "Import failed",
      );
      setStep("review");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [parseResult, rawRows, uploadedBy, addFunction, history]);

  const reset = useCallback(() => {
    setStep("upload");
    setFilename("");
    setRawRows([]);
    setParseResult(null);
    setImportResult(null);
    setColumnOverrides({});
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  const renderUploadZone = () => (
    <ScrollView contentContainerStyle={s.scrollContent}>
      {/* Drop zone */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        {Platform.OS === "web" ? (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleWebDrop}
            style={{ borderRadius: 16 }}
          >
            <DropZoneContent
              isDragging={isDragging}
              isLoading={isLoading}
              onPress={pickFile}
              colors={colors}
            />
          </div>
        ) : (
          <DropZoneContent
            isDragging={false}
            isLoading={isLoading}
            onPress={pickFile}
            colors={colors}
          />
        )}
      </Animated.View>

      {/* Supported formats */}
      <View
        style={[
          s.formatsRow,
          { backgroundColor: colors.secondary, borderColor: colors.border },
        ]}
      >
        <Text style={[s.formatsTitle, { color: colors.mutedForeground }]}>
          Supported formats
        </Text>
        <View style={s.formatsChips}>
          {["XLSX", "XLS", "CSV"].map((f) => (
            <View
              key={f}
              style={[
                s.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[s.chipText, { color: colors.foreground }]}>
                {f}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[
            s.formatsTitle,
            { color: colors.mutedForeground, marginTop: 12 },
          ]}
        >
          Compatible systems
        </Text>
        <View style={s.formatsChips}>
          {[
            "Moments Explorer",
            "Delphi",
            "Opera",
            "iVvy",
            "Priava",
            "Tripleseat",
          ].map((s2) => (
            <View
              key={s2}
              style={[
                s.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[s.chipText, { color: colors.mutedForeground }]}>
                {s2}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderReview = () => {
    if (!parseResult) return null;
    const hasErrors = parseResult.errors.length > 0;
    return (
      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Summary */}
        <View
          style={[
            s.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: colors.foreground }]}>
                {parseResult.totalRows}
              </Text>
              <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>
                Total rows
              </Text>
            </View>
            <View
              style={[s.summaryDivider, { backgroundColor: colors.border }]}
            />
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: "#22C55E" }]}>
                {parseResult.validRows}
              </Text>
              <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>
                Ready to import
              </Text>
            </View>
            <View
              style={[s.summaryDivider, { backgroundColor: colors.border }]}
            />
            <View style={s.summaryItem}>
              <Text
                style={[
                  s.summaryNum,
                  {
                    color:
                      parseResult.errors.length > 0
                        ? colors.destructive
                        : colors.mutedForeground,
                  },
                ]}
              >
                {parseResult.errors.length}
              </Text>
              <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>
                Errors
              </Text>
            </View>
          </View>

          <View style={[s.sourceBadgeRow, { borderTopColor: colors.border }]}>
            <Feather name="database" size={12} color={colors.primary} />
            <Text style={[s.sourceBadgeText, { color: colors.primary }]}>
              {parseResult.sourceSystem.replace(/_/g, " ")} —{" "}
              {parseResult.filename}
            </Text>
          </View>
        </View>

        {/* Smart column mapping editor */}
        <ColumnMappingEditor
          details={parseResult.columnMappingDetails ?? []}
          availableHeaders={availableHeaders}
          onOverride={handleMappingOverride}
          isRemapping={isRemapping}
        />

        {/* Errors / warnings */}
        <ValidationTable items={parseResult.errors} type="error" />
        <ValidationTable items={parseResult.warnings} type="warning" />

        {/* Preview rows */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
          Preview (first {parseResult.preview.length} rows)
        </Text>
        {parseResult.preview.map((row, i) => (
          <PreviewCard key={i} row={row} index={i} />
        ))}

        {/* Actions */}
        <View style={s.reviewActions}>
          <Pressable
            style={[s.btnSecondary, { borderColor: colors.border }]}
            onPress={reset}
          >
            <Text
              style={[s.btnSecondaryText, { color: colors.mutedForeground }]}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            style={[
              s.btnPrimary,
              { backgroundColor: colors.primary },
              hasErrors && parseResult.validRows === 0 && s.btnDisabled,
            ]}
            onPress={handleConfirmImport}
            disabled={parseResult.validRows === 0}
          >
            <Feather name="upload-cloud" size={16} color="#fff" />
            <Text style={s.btnPrimaryText}>
              Import {parseResult.validRows} event
              {parseResult.validRows !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderDone = () => (
    <View style={s.doneContainer}>
      <View style={[s.doneIcon, { backgroundColor: "#22C55E20" }]}>
        <Feather name="check-circle" size={48} color="#22C55E" />
      </View>
      <Text style={[s.doneTitle, { color: colors.foreground }]}>
        Import complete
      </Text>
      <Text style={[s.doneSubtitle, { color: colors.mutedForeground }]}>
        {importResult?.imported} event{importResult?.imported !== 1 ? "s" : ""}{" "}
        added to your kitchen
        {importResult?.failed ? ` · ${importResult.failed} skipped` : ""}
      </Text>
      <View style={s.doneActions}>
        <Pressable
          style={[s.btnSecondary, { borderColor: colors.border }]}
          onPress={reset}
        >
          <Text style={[s.btnSecondaryText, { color: colors.mutedForeground }]}>
            Import another
          </Text>
        </Pressable>
        <Pressable
          style={[s.btnPrimary, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/functions")}
        >
          <Text style={s.btnPrimaryText}>View functions</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={{ flex: 1 }}>
      {historyLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={s.emptyHistory}>
          <Feather name="clock" size={36} color={colors.mutedForeground} />
          <Text style={[s.emptyHistoryText, { color: colors.mutedForeground }]}>
            No imports yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryRow item={item} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          s.header,
          { paddingTop: insets.top + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Import Events
          </Text>
          <Text style={[s.headerSubtitle, { color: colors.mutedForeground }]}>
            Moments Explorer · XLSX · CSV
          </Text>
        </View>
        <View style={s.headerRight} />
      </View>

      {/* Tab bar (only on upload step) */}
      {step === "upload" && (
        <View style={[s.tabBar, { borderBottomColor: colors.border }]}>
          {(["upload", "history"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                s.tab,
                activeTab === tab && [
                  s.tabActive,
                  { borderBottomColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  s.tabText,
                  {
                    color:
                      activeTab === tab
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                {tab === "upload" ? "Upload" : "History"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {step === "upload" && activeTab === "upload" && renderUploadZone()}
        {step === "upload" && activeTab === "history" && renderHistory()}
        {step === "review" && renderReview()}
        {step === "importing" && (
          <View style={s.doneContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                s.doneSubtitle,
                { color: colors.mutedForeground, marginTop: 20 },
              ]}
            >
              Importing events…
            </Text>
          </View>
        )}
        {step === "done" && renderDone()}
      </View>
    </View>
  );
}

// ─── DropZoneContent ──────────────────────────────────────────────────────

function DropZoneContent({
  isDragging,
  isLoading,
  onPress,
  colors,
}: {
  isDragging: boolean;
  isLoading: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.dropZone,
        {
          borderColor: isDragging ? colors.primary : colors.border,
          backgroundColor: isDragging ? colors.primary + "12" : colors.card,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <View
            style={[s.dropIcon, { backgroundColor: colors.primary + "20" }]}
          >
            <Feather name="upload-cloud" size={32} color={colors.primary} />
          </View>
          <Text style={[s.dropTitle, { color: colors.foreground }]}>
            {isDragging ? "Drop to import" : "Upload spreadsheet"}
          </Text>
          <Text style={[s.dropSubtitle, { color: colors.mutedForeground }]}>
            {Platform.OS === "web"
              ? "Drag & drop here, or tap to browse"
              : "Tap to select file from your device"}
          </Text>
          <View style={[s.dropBtn, { backgroundColor: colors.primary }]}>
            <Feather name="folder" size={14} color="#fff" />
            <Text style={s.dropBtnText}>Browse files</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  headerRight: { width: 30 },
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: "600" },
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginBottom: 16,
  },
  dropIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  dropTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  dropSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  dropBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  formatsRow: { borderRadius: 12, borderWidth: 1, padding: 16 },
  formatsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formatsChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "500" },
  summaryCard: { borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  summaryNum: { fontSize: 28, fontWeight: "800" },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryDivider: { width: 1, height: 40 },
  sourceBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sourceBadgeText: { fontSize: 12, fontWeight: "500" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  validationTable: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  validationTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  validationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  validationRow2: { fontSize: 11, width: 44, flexShrink: 0 },
  validationMsg: { fontSize: 12, flex: 1, lineHeight: 16 },
  validationMore: { fontSize: 11, marginTop: 4 },
  previewCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  previewCardIdx: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  previewField: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  previewFieldKey: { fontSize: 11, width: 100, flexShrink: 0 },
  previewFieldVal: { fontSize: 12, flex: 1 },
  reviewActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnSecondaryText: { fontWeight: "600", fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  doneIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  doneTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  doneSubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  doneActions: { flexDirection: "row", gap: 10, marginTop: 28, width: "100%" },
  historyRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  historyRowLeft: { flex: 1, marginRight: 10 },
  historyFileName: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  historyMeta: { fontSize: 11, marginBottom: 4 },
  historyStats: { flexDirection: "row", flexWrap: "wrap" },
  historyStatText: { fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  emptyHistory: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyHistoryText: { fontSize: 15 },
});

// ─── ColumnMappingEditor styles (ms = mapping styles) ────────────────────

const ms = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: { fontSize: 10, fontWeight: "700" },
  summaryText: { fontSize: 11, fontWeight: "600" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 10, flexShrink: 0 },
  fieldLabel: { fontSize: 12, width: 96, flexShrink: 0 },
  rowRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    minWidth: 0,
  },
  headerText: { fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right" },
  confBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  confBadgeText: { fontSize: 9, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000070",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 12,
    lineHeight: 18,
  },
  suggestionsBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionChipText: { fontSize: 12, fontWeight: "600", maxWidth: 120 },
  suggestionScore: { fontSize: 10, fontWeight: "700" },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerItemText: { fontSize: 14, flex: 1 },
  modalCancel: {
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalCancelText: { fontSize: 15, fontWeight: "600" },
});
