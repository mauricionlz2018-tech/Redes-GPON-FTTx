import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  KNOWLEDGE_BASE,
  MANUAL_MODULES,
  QUICK_QUESTIONS,
  PREDETERMINED_CATEGORIES,
  searchKnowledge,
  KnowledgeItem
  getLearnedKnowledge,
  saveLearnedKnowledge,
  deleteLearnedKnowledge,
  KnowledgeItem,
  LearnedKnowledgeItem,
  PredeterminedCategory
} from '../data/assistantKnowledgeBase';
import {
  Bot,
  X,
  Send,
  MessageSquare,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  MapPin,
  UserCheck,
  Shield,
  Compass,
  WifiOff,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle2,
  Search
  Search,
  GraduationCap,
  Plus,
  Trash2,
  Layers,
  Sparkle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  knowledgeItem?: KnowledgeItem;
  unresolvedQuery?: string;
  timestamp: string;
}

export const AssistantChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'manual'>('chat');
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'learn' | 'manual'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>('mod_mapa');
  const [manualSearch, setManualSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_naps');

  // Estado para el formulario de aprendizaje dinámico
  const [learnQuestion, setLearnQuestion] = useState('');
  const [learnAnswer, setLearnAnswer] = useState('');
  const [learnAuthor, setLearnAuthor] = useState('');
  const [learnSuccess, setLearnSuccess] = useState<string | null>(null);
  const [learnedList, setLearnedList] = useState<LearnedKnowledgeItem[]>([]);

  // Cargar conocimientos aprendidos
  const refreshLearnedList = () => {
    setLearnedList(getLearnedKnowledge());
  };

  useEffect(() => {
    refreshLearnedList();
  }, []);

  // Mensaje inicial de bienvenida según el rol
  const getInitialMessage = (): ChatMessage => {
    const roleName = user?.rol || 'Usuario';
    return {
      id: 'msg-initial',
      sender: 'bot',
      text: `Hola ${user?.nombre_completo || 'Compañero'}, bienvenido al Asistente Virtual GPON. Tu sesión actual tiene rol de ${roleName}. ¿En qué proceso de la red o del sistema te puedo apoyar hoy?`,
      text: `¡Hola ${user?.nombre_completo || 'Compañero'}! Bienvenido al Asistente Inteligente GPON. Tu sesión actual tiene rol de ${roleName}.\n\nPuedes hacerme cualquier consulta técnica sobre cajas NAP, puertos, potencias en dBm, reportes PDF o navegación en campo. También puedes explorar las preguntas predeterminadas o enseñarme nuevas respuestas.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-gpon-assistant', handleOpenEvent);
    return () => window.removeEventListener('open-gpon-assistant', handleOpenEvent);
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simular procesamiento del asistente
    // Procesamiento con búsqueda local (NLP + Base de Aprendizaje)
    setTimeout(() => {
      const match = searchKnowledge(query);

      let botResponse: ChatMessage;

      if (match) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: match.item.shortAnswer,
          knowledgeItem: match.item,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text:
            'No encontré una respuesta directa para esa consulta exacta, pero puedes seleccionar alguna de las preguntas frecuentes abajo o explorar el Manual Rápido en la pestaña superior.',
            'No encontré una respuesta directa para esa consulta exacta en la base técnica.',
          unresolvedQuery: query,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 350);
    }, 300);
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage()]);
  };

  const handleAskQuestionChip = (question: string) => {
    setActiveTab('chat');
    handleSendMessage(question);
  };

  const handleStartTeaching = (prefillQuestion?: string) => {
    if (prefillQuestion) {
      setLearnQuestion(prefillQuestion);
    }
    setActiveTab('learn');
  };

  const handleSaveLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnQuestion.trim() || !learnAnswer.trim()) return;

    const author = learnAuthor.trim() || user?.nombre_completo || 'Equipo de Operación';
    saveLearnedKnowledge(learnQuestion, learnAnswer, author);

    refreshLearnedList();
    setLearnSuccess(`¡Excelente! He memorizado esta respuesta. Ahora podré responderla a quien consulte.`);
    setLearnQuestion('');
    setLearnAnswer('');

    setTimeout(() => {
      setLearnSuccess(null);
    }, 4000);
  };

  const handleDeleteLearned = (id: string) => {
    deleteLearnedKnowledge(id);
    refreshLearnedList();
  };

  // Filtrado de módulos del manual
  const filteredModules = MANUAL_MODULES.filter(
    (m) =>
      m.title.toLowerCase().includes(manualSearch.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(manualSearch.toLowerCase()) ||
      m.sections.some(
        (s) =>
          s.heading.toLowerCase().includes(manualSearch.toLowerCase()) ||
          s.content.toLowerCase().includes(manualSearch.toLowerCase())
      )
  );

  const getModuleIcon = (iconName: string) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'MapPin':
        return <MapPin className="w-4 h-4 text-sky-400" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
        return <MapPin className="w-3.5 h-3.5 text-sky-400" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'FileText':
        return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'WifiOff':
        return <WifiOff className="w-4 h-4 text-orange-400" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-purple-400" />;
        return <Compass className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
        return <Bot className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha */}
      <div className="fixed bottom-5 right-5 z-40">
      {/* Botón Flotante: Circular y compacto en celular, pill estilizado en PC */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-xl shadow-sky-950/40 border border-sky-400/30 transition-all duration-300 hover:scale-105 active:scale-95"
            title="Abrir Asistente Virtual y Manual GPON"
            className="group flex items-center justify-center sm:gap-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white w-12 h-12 sm:w-auto sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-sky-950/60 border border-sky-300/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title="Abrir Asistente Virtual GPON"
            aria-label="Abrir Asistente Virtual GPON"
          >
            <div className="relative">
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <span className="font-semibold text-xs tracking-wide">Asistente GPON</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-semibold text-xs tracking-wide">Asistente GPON</span>
            <Sparkles className="hidden sm:inline w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform" />
          </button>
        ) : null}
      </div>

      {/* Ventana Flotante del Asistente Virtual */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[95vw] sm:w-[480px] h-[85vh] sm:h-[620px] max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-slate-100">
          {/* Cabecera del Asistente */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-700 flex-shrink-0">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 p-3 sm:p-3.5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-700 flex-shrink-0">
                <img
                  src="/logo-gpon.png"
                  alt="GPON Telecom"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white">Asistente GPON Telecom</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium">
                  <h3 className="font-bold text-xs sm:text-sm text-white truncate">Asistente GPON Telecom</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    En línea
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  ISP EDOMEX - Soporte y Guía de Operación
                <p className="text-[10px] text-slate-400 truncate">
                  ISP EDOMEX • Soporte Técnico y Guía Inteligente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selector de Pestañas: Chatbot vs Manual */}
          <div className="flex items-center bg-slate-950/80 p-1 border-b border-slate-800">
          {/* Selector de Pestañas: Chatbot, FAQ Predeterminado, Enseñar al Bot, Manual */}
          <div className="flex items-center bg-slate-950/90 p-1 border-b border-slate-800 gap-1 flex-shrink-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chatbot Asistente</span>
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 min-w-[85px] flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Preguntas</span>
            </button>

            <button
              onClick={() => setActiveTab('learn')}
              className={`flex-1 min-w-[85px] flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'learn'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
              title="Enseñar nuevas respuestas al bot"
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Aprender</span>
              {learnedList.length > 0 && (
                <span className="text-[9px] bg-emerald-500/20 px-1 rounded-full font-bold">
                  {learnedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              className={`flex-1 min-w-[75px] flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manual Rápido</span>
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Manual</span>
            </button>
          </div>

          {/* ================================================================ */}
          {/* PESTAÑA 1: CHATBOT INTERACTIVO */}
          {/* ================================================================ */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90">
              {/* Chips de Preguntas Frecuentes Rápidas */}
              {/* Chips de Preguntas Rápidas en la parte superior */}
              <div className="p-2 border-b border-slate-800 bg-slate-950/40">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1 px-1">
                  Preguntas frecuentes:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {QUICK_QUESTIONS.slice(0, 5).map((q, idx) => (
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Consultas frecuentes (toca para preguntar):
                  </span>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className="text-[10px] text-sky-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>Ver todas</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskQuestionChip(q)}
                      className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700 px-2.5 py-1 rounded-full transition-colors flex-shrink-0"
                      className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-750 hover:border-sky-500/40 px-2.5 py-1 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Mensajes */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-sky-400 font-bold text-[11px]">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Asistente GPON</span>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Asistente GPON</span>
                          </div>

                          {/* Distintivo de respuesta aprendida por el usuario */}
                          {msg.knowledgeItem?.isLearned && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium">
                              <Sparkle className="w-2.5 h-2.5" />
                              Respuesta Aprendida
                            </span>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Tarjeta detallada si hay un item de conocimiento */}
                      {msg.knowledgeItem && (
                      {/* Tarjeta de pasos si viene de base técnica */}
                      {msg.knowledgeItem?.detailedSteps && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-2">
                          {msg.knowledgeItem.detailedSteps && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                                Procedimiento Paso a Paso:
                              </span>
                              <div className="space-y-1 bg-slate-900/70 p-2 rounded-lg border border-slate-750">
                                {msg.knowledgeItem.detailedSteps.map((step, sIdx) => (
                                  <div key={sIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>{step}</span>
                                  </div>
                                ))}
                          <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                            Procedimiento Paso a Paso:
                          </span>
                          <div className="space-y-1.5 bg-slate-900/70 p-2.5 rounded-lg border border-slate-750">
                            {msg.knowledgeItem.detailedSteps.map((step, sIdx) => (
                              <div key={sIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </div>
                            </div>
                          )}
                            ))}
                          </div>
                        </div>
                      )}

                          {msg.knowledgeItem.tips && msg.knowledgeItem.tips.length > 0 && (
                            <div className="bg-sky-950/40 border border-sky-800/60 p-2 rounded-lg">
                              <span className="text-[10px] font-bold text-sky-300 flex items-center gap-1 mb-0.5">
                                <AlertCircle className="w-3 h-3" />
                                Recomendación Técnica:
                              </span>
                              {msg.knowledgeItem.tips.map((tip, tIdx) => (
                                <p key={tIdx} className="text-[10px] text-slate-300">
                                  {tip}
                                </p>
                              ))}
                            </div>
                          )}
                      {/* Recomendación Técnica */}
                      {msg.knowledgeItem?.tips && msg.knowledgeItem.tips.length > 0 && (
                        <div className="mt-2 bg-sky-950/40 border border-sky-800/60 p-2 rounded-lg">
                          <span className="text-[10px] font-bold text-sky-300 flex items-center gap-1 mb-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Recomendación Técnica:
                          </span>
                          {msg.knowledgeItem.tips.map((tip, tIdx) => (
                            <p key={tIdx} className="text-[10px] text-slate-300">
                              {tip}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Si la consulta no tuvo respuesta directa: invitación a enseñarle al bot */}
                      {msg.unresolvedQuery && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-2">
                          <p className="text-[11px] text-slate-400">
                            Puedes consultar las preguntas frecuentes en la pestaña superior o enseñarme la respuesta a esta duda para recordarla en el futuro:
                          </p>
                          <button
                            onClick={() => handleStartTeaching(msg.unresolvedQuery)}
                            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Enseñar respuesta a esta duda</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/70 border border-slate-700 w-fit px-3 py-2 rounded-2xl rounded-bl-none">
                    <Bot className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                    <span className="text-[11px]">Consultando manual y base técnica...</span>
                    <span className="text-[11px]">Consultando base técnica y conocimientos...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de Entrada de Pregunta */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
                className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 flex-shrink-0"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Escribe tu duda (ej. cómo asignar cliente, dBm, GPS)..."
                  placeholder="Escribe tu consulta (ej. eliminar caja, dBm, sincronizar)..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white p-2 rounded-xl transition-colors shadow-md flex-shrink-0"
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white p-2 rounded-xl transition-colors shadow-md flex-shrink-0 cursor-pointer"
                  title="Enviar consulta"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* PESTAÑA 2: MANUAL RÁPIDO ILUSTRADO */}
          {/* ================================================================ */}
          {/* PESTAÑA 2: PREGUNTAS PREDETERMINADAS POR CATEGORÍA */}
          {/* ================================================================ */}
          {activeTab === 'faq' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90">
              <div className="p-3 border-b border-slate-800 bg-slate-950/60">
                <h4 className="text-xs font-bold text-white mb-0.5">Catálogo de Preguntas Predeterminadas</h4>
                <p className="text-[10px] text-slate-400">
                  Selecciona una categoría y toca cualquier pregunta para obtener la respuesta paso a paso.
                </p>

                {/* Filtro de Categorías en píldoras */}
                <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-1 scrollbar-none">
                  {PREDETERMINED_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                        }`}
                      >
                        {getCategoryIcon(cat.iconName)}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista de preguntas de la categoría seleccionada */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {PREDETERMINED_CATEGORIES.filter((c) => c.id === selectedCategory).map((category) => (
                  <div key={category.id} className="space-y-2">
                    <p className="text-[11px] text-slate-400 italic mb-2">
                      {category.description}
                    </p>

                    {category.questions.map((item, qIdx) => (
                      <div
                        key={qIdx}
                        className="bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl p-3 transition-colors flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-sky-300">{item.question}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.summary}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAskQuestionChip(item.question)}
                          className="self-end bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ver respuesta en el Chat</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PESTAÑA 3: ENSEÑAR AL BOT (APRENDIZAJE DINÁMICO) */}
          {/* ================================================================ */}
          {activeTab === 'learn' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 overflow-y-auto p-3 space-y-4">
              {/* Tarjeta de Formulario para Enseñar */}
              <div className="bg-slate-850 border border-slate-750 rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Enseñar nueva respuesta al Asistente</h4>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">
                  Escribe una duda y la respuesta técnica adecuada. El bot memorizará la información y responderá de forma automática cuando alguien consulte sobre ese tema.
                </p>

                {learnSuccess && (
                  <div className="mb-3 p-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{learnSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveLearning} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      Pregunta o consulta del usuario *
                    </label>
                    <input
                      type="text"
                      value={learnQuestion}
                      onChange={(e) => setLearnQuestion(e.target.value)}
                      placeholder="Ej: ¿Qué hacer si se corta la fibra en el troncal?"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      Respuesta que debe dar el bot *
                    </label>
                    <textarea
                      rows={3}
                      value={learnAnswer}
                      onChange={(e) => setLearnAnswer(e.target.value)}
                      placeholder="Ej: Reportar inmediatamente a ODF Central, verificar el reflectómetro OTDR y revisar las coordenadas de la muffa más cercana..."
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      Autor o Rol (opcional)
                    </label>
                    <input
                      type="text"
                      value={learnAuthor}
                      onChange={(e) => setLearnAuthor(e.target.value)}
                      placeholder={user?.nombre_completo || 'Soporte / Administrador'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar y Enseñar al Asistente</span>
                  </button>
                </form>
              </div>

              {/* Lista de Conocimientos Aprendidos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Conocimientos memorizados por el bot ({learnedList.length})</span>
                  </h5>
                </div>

                {learnedList.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
                    Aún no se han registrado respuestas personalizadas. ¡Utiliza el formulario de arriba para enseñarle!
                  </div>
                ) : (
                  learnedList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-850 border border-slate-750 rounded-xl p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h6 className="text-xs font-bold text-emerald-300">{item.question}</h6>
                          <span className="text-[9px] text-slate-500">
                            Por {item.author || 'Equipo'} • {item.createdAt}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteLearned(item.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Eliminar este conocimiento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        {item.answer}
                      </p>

                      <button
                        onClick={() => handleAskQuestionChip(item.question)}
                        className="self-end text-[10px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Probar en el Chat</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PESTAÑA 4: MANUAL RÁPIDO ILUSTRADO */}
          {/* ================================================================ */}
          {activeTab === 'manual' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90">
              {/* Buscador de Manual */}
              <div className="p-2.5 border-b border-slate-800 bg-slate-950/60">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Buscar tema en el manual (ej. GPS, roles, splitter)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Acordeón de Módulos */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredModules.map((mod) => {
                  const isExpanded = expandedModule === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-800 rounded-xl bg-slate-850 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                            {getModuleIcon(mod.iconName)}
                            {getCategoryIcon(mod.iconName)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{mod.title}</h4>
                            <p className="text-[10px] text-slate-400">{mod.subtitle}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-3 text-xs">
                          {mod.sections.map((sec, secIdx) => (
                            <div key={secIdx} className="space-y-1.5">
                              <h5 className="font-semibold text-sky-400 text-[11px] flex items-center gap-1">
                                <span>{sec.heading}</span>
                              </h5>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{sec.content}</p>

                              {sec.points && (
                                <ul className="space-y-1 pl-1">
                                  {sec.points.map((pt, pIdx) => (
                                    <li key={pIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 mt-1.5" />
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {sec.important && (
                                <div className="p-2 bg-amber-950/30 border border-amber-800/50 rounded-lg text-[10px] text-amber-200">
                                  <span className="font-bold">Regla Importante: </span>
                                  {sec.important}
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            onClick={() => handleAskQuestionChip(`Quiero saber más sobre: ${mod.title}`)}
                            className="w-full mt-2 py-1.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                            className="w-full mt-2 py-1.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Preguntar al Asistente sobre este tema</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredModules.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No se encontraron temas en el manual para esa búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
