import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image as RNImage,
  Modal,
  Platform,
} from "react-native";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import Markdown from "react-native-markdown-display";
import { launchImageLibrary } from "react-native-image-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  Canvas,
  Path,
  useTouchHandler,
  Skia,
  useCanvasRef,
  Image,
  useImage,
} from "@shopify/react-native-skia";
import { VITE_GOOGLE_API_KEY } from '@env';

// Configuración de la API de Google GenAI
const ai = new GoogleGenerativeAI({ apiKey: VITE_GOOGLE_API_KEY });

const MARKER_COLORS = ["#000000", "#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#A855F7"];
const { width: screenWidth } = Dimensions.get("window");
const isTablet = screenWidth > 768;

// Componente principal de DrawBot para React Native
export default function DrawBot() {
  const canvasRef = useCanvasRef();
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [tool, setTool] = useState("marker");
  const [markerColor, setMarkerColor] = useState("#000000");
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  // Gestión del historial de dibujo
  const [paths, setPaths] = useState([]);
  const currentPath = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Gestión de la imagen de fondo
  const [baseImageUri, setBaseImageUri] = useState(null);
  const skiaImage = useImage(baseImageUri);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });

  const saveHistory = useCallback((newPaths) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPaths);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPaths(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPaths(history[newIndex]);
    }
  };
  
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      if (!showDrawingTools) return;
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      const newPathObject = {
        path: newPath,
        color: tool === "marker" ? markerColor : "transparent",
        strokeWidth: tool === "marker" ? 5 : 25,
        blendMode: tool === "eraser" ? "clear" : "srcOver",
      };
      currentPath.current = newPathObject;
      setPaths(prev => [...prev, newPathObject]);
    },
    onActive: ({ x, y }) => {
      if (!showDrawingTools || !currentPath.current) return;
      currentPath.current.path.lineTo(x, y);
      canvasRef.current?.requestRedraw();
    },
    onEnd: () => {
      if (!showDrawingTools) return;
      currentPath.current = null;
      saveHistory(paths);
    },
  });

  const clearDrawing = () => {
    setPaths([]);
    saveHistory([]);
  };

  const clearAll = () => {
    setGeneratedText("");
    setPrompt("");
    setError("");
    setShowDrawingTools(false);
    setBaseImageUri(null);
    setPaths([]);
    setHistory([]);
    setHistoryIndex(-1);
  };
  
  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        setError("Error al cargar la imagen. Inténtalo de nuevo.");
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setBaseImageUri(uri);
        clearDrawing();
        setShowDrawingTools(false);
        setGeneratedText("");
      }
    });
  };

  const getCanvasAsBase64 = async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (image) {
      return image.encodeToBase64();
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!prompt || loading) return;
    setLoading(true);
    setGeneratedText("");
    setError("");
    setShowDrawingTools(false);
  
    try {
      const imageBase64 = await getCanvasAsBase64();
      if (!imageBase64) {
        throw new Error("No se pudo capturar la imagen del lienzo.");
      }
  
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png",
        },
      };

      const textPart = {
          text: `Eres un experto ilustrador educativo. Tu tarea es explicar un concepto y crear un nuevo diagrama claro y preciso desde cero. Tema: ${prompt}. Idioma: Toda la respuesta, incluidas las explicaciones y etiquetas del diagrama, DEBE estar en español. Instrucciones para la explicación del texto: 1. Proporciona una explicación completa pero fácil de entender del tema en español. 2. Utiliza Markdown para un formato claro: usa encabezados, negritas para términos clave y listas. Instrucciones para el diagrama: 1. Genera un nuevo diagrama desde cero basado en el tema. 2. Crea un diagrama científicamente preciso y bien etiquetado. Todas las etiquetas deben estar en español. 3. El estilo visual debe ser un doodle de líneas limpio, minimalista y en blanco y negro.`
      };

      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([imagePart, textPart]);
      const response = result.response;
      
      const textResponse = response.text();
      setGeneratedText(textResponse);
      
    } catch (err) {
      setError("Error al generar la explicación. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.pageWrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titlePart1}>Draw</Text>
          <Text style={styles.titlePart2}>Bot</Text>
        </Text>
        <Text style={styles.description}>
          Dibuja en el lienzo o introduce un tema para obtener una explicación y un diagrama generados por IA.
        </Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.canvasContainer}>
          {baseImageUri && (
            <View style={styles.toolsRow}>
              <TouchableOpacity
                onPress={() => setShowDrawingTools(!showDrawingTools)}
                style={[styles.toolButton, showDrawingTools && styles.toolButtonActive]}
              >
                <MaterialIcons name="edit" size={20} color={showDrawingTools ? 'white' : '#495057'} />
                <Text style={[styles.toolButtonText, showDrawingTools && { color: 'white' }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setImagePreviewOpen(true)} style={styles.toolButton}>
                <MaterialIcons name="photo" size={20} color="#495057" />
                <Text style={styles.toolButtonText}>Vista Previa</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDrawingTools && (
            <View style={styles.toolsContainer}>
              <View style={styles.toolsRow}>
                <TouchableOpacity onPress={() => setTool('marker')} style={[styles.toolButton, tool === 'marker' && styles.toolButtonActive]}>
                  <MaterialIcons name="draw" size={20} color={tool === 'marker' ? 'white' : '#495057'} />
                  <Text style={[styles.toolButtonText, tool === 'marker' && {color: 'white'}]}>Rotulador</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTool('eraser')} style={[styles.toolButton, tool === 'eraser' && styles.toolButtonActive]}>
                  <MaterialIcons name="cleaning-services" size={20} color={tool === 'eraser' ? 'white' : '#495057'} />
                  <Text style={[styles.toolButtonText, tool === 'eraser' && {color: 'white'}]}>Borrador</Text>
                </TouchableOpacity>
              </View>
              {tool === 'marker' && (
                <View style={styles.colorPalette}>
                  {MARKER_COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorSwatch, { backgroundColor: color }, markerColor === color && styles.colorSwatchActive]}
                      onPress={() => setMarkerColor(color)}
                    />
                  ))}
                </View>
              )}
              <View style={styles.historyControls}>
                <TouchableOpacity onPress={handleUndo} disabled={historyIndex <= 0} style={styles.toolButton}>
                  <MaterialIcons name="undo" size={24} color={historyIndex <= 0 ? '#adb5bd' : '#495057'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRedo} disabled={historyIndex >= history.length - 1} style={styles.toolButton}>
                  <MaterialIcons name="redo" size={24} color={historyIndex >= history.length - 1 ? '#adb5bd' : '#495057'} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.canvasWrapper} onLayout={(e) => setCanvasSize(e.nativeEvent.layout)}>
            <Canvas style={{ flex: 1 }} ref={canvasRef} onTouch={touchHandler}>
                <Image image={skiaImage} fit="contain" x={0} y={0} width={canvasSize.width} height={canvasSize.height} />
                {paths.map((p, index) => (
                    <Path key={index} path={p.path} color={p.color} style="stroke" strokeWidth={p.strokeWidth} strokeCap="round" blendMode={p.blendMode} />
                ))}
            </Canvas>
            {!baseImageUri && paths.length === 0 && (
              <View style={styles.canvasPlaceholder}>
                <Text style={styles.canvasPlaceholderText}>Tu dibujo o diagrama aparecerá aquí.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.generatedTextWrapper}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {generatedText ? (
              <Markdown>{generatedText}</Markdown>
            ) : (
              <View style={styles.placeholderTextContainer}>
                <Text style={styles.placeholderText}>Tu explicación generada por IA aparecerá aquí.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.form}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Explica un concepto como 'trigonometría'..."
          style={styles.promptInput}
          placeholderTextColor="#6c757d"
        />
        <TouchableOpacity onPress={handleSubmit} disabled={loading || !prompt} style={[styles.iconButton, styles.submitButton]}>
          {loading ? <ActivityIndicator color="white" /> : <MaterialIcons name="send" style={styles.icon} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleImageUpload} style={[styles.iconButton, styles.secondaryButton]}>
          <MaterialIcons name="file-upload" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={clearAll} style={[styles.iconButton, styles.secondaryButton]}>
          <MaterialIcons name="delete" style={styles.icon} />
        </TouchableOpacity>
      </View>

       <Modal visible={imagePreviewOpen} transparent={true} onRequestClose={() => setImagePreviewOpen(false)}>
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity style={styles.previewCloseButton} onPress={() => setImagePreviewOpen(false)}>
            <Text style={styles.previewCloseText}>&times;</Text>
          </TouchableOpacity>
          {baseImageUri && <RNImage source={{ uri: baseImageUri }} style={styles.previewImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, gap: 16 },
  header: { gap: 8 },
  title: { fontSize: 32 },
  titlePart1: { color: '#443FE1', fontWeight: '700' },
  titlePart2: { color: '#2a2a2a', fontWeight: '500' },
  description: { color: '#242424', fontSize: 16 },
  mainContent: { flex: 1, flexDirection: isTablet ? 'row' : 'column', gap: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', padding: 12, backgroundColor: 'rgba(255,255,255,0.7)' },
  canvasContainer: { flex: 1, gap: 12 },
  toolsContainer: { padding: 8, backgroundColor: 'rgba(222, 226, 230, 0.5)', borderRadius: 12, gap: 8 },
  toolsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  toolButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f8f9fa', borderRadius: 8 },
  toolButtonActive: { backgroundColor: '#443FE1' },
  toolButtonText: { color: '#495057', fontWeight: '500' },
  colorPalette: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  colorSwatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  colorSwatchActive: { borderColor: 'white', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
  historyControls: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  canvasWrapper: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  canvasPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  canvasPlaceholderText: { color: '#868e96', fontSize: 16, textAlign: 'center' },
  generatedTextWrapper: { flex: 1, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  placeholderTextContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#868e96', fontSize: 16, textAlign: 'center' },
  errorMessage: { textAlign: 'center', color: '#d9480f', padding: 12, borderRadius: 8, backgroundColor: 'rgba(255, 224, 224, 0.8)' },
  form: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  promptInput: { flex: 1, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ced4da', color: '#212529' },
  iconButton: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  submitButton: { backgroundColor: '#443FE1' },
  secondaryButton: { backgroundColor: '#f1f3f5' },
  icon: { fontSize: 24, color: 'white' },
  imagePreviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '95%', height: '80%' },
  previewCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  previewCloseText: { fontSize: 40, color: 'white', fontWeight: '300' },
});