import { StyleSheet } from 'react-native';
import { CORES } from '../../theme';

export const estilo = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: CORES.fundo 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 20 
  },
  tituloCabecalho: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: CORES.roxo 
  },
  subtitulo: { 
    fontSize: 15, 
    color: CORES.textoSecundario,
    padding: 8,
    marginBottom: 3,
  },
 botaoMarcaPagina: { 
    position: 'absolute',
    top: 0,                   
    right: 13,                
    width: 48,                
    height: 70,               
    backgroundColor: '#F5A623', 
    borderBottomLeftRadius: 2,  
    borderBottomRightRadius: 2,
    zIndex: 20,               // Garante que fica por cima de tudo
  },
corteMarcaPagina: {
   position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 24,    // Metade da largura da fita (48 / 2)
    borderRightWidth: 24,   // Metade da largura da fita (48 / 2)
    borderBottomWidth: 14,    // Altura/profundidade do "V"
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CORES.fundo,
  },
  textoMarcaPagina: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: CORES.roxo 
  },
  card: {
    backgroundColor: CORES.branco,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  cardHeaderInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 6 
  },
  cardTitulo: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: CORES.texto 
  },
  cardData: { 
    fontSize: 12, 
    color: CORES.textoSecundario 
  },
  cardDescricao: { 
    fontSize: 14, 
    color: CORES.texto, 
    marginBottom: 12 
  },
  cardBotoes: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 10 
  },
  botaoEditar: { 
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderColor: CORES.borda,
    backgroundColor: CORES.branco
  },
  textoEditar: { 
    color: CORES.roxo, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  botaoExcluir: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    backgroundColor: CORES.vermelho,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  textoExcluir: {
    color: CORES.vermelho,
    fontSize: 12,
    fontWeight: "600",
  },
  cardFormulario: {
    backgroundColor: CORES.branco,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  formTitulo: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: CORES.texto, 
    marginBottom: 12 
  },
  input: { 
    height: 44,
    borderWidth: 1, 
    borderColor: CORES.borda, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    marginBottom: 12, 
    color: CORES.texto, 
    backgroundColor: CORES.branco,
    fontSize: 14
  },
  textArea: { 
    height: 90, 
    paddingTop: 10,
    textAlignVertical: 'top' 
  },
  botaoSalvar: { 
    backgroundColor: CORES.roxo, 
    borderRadius: 10, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 4
  },
  textoBotaoSalvar: { 
    color: CORES.branco, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  botaoVoltar: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: CORES.branco, 
    borderWidth: 1, 
    borderColor: CORES.borda, 
    borderRadius: 10, 
    height: 45,
    gap: 6,
    marginTop: 10
  },
  textoVoltar: { 
    color: CORES.roxo, 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});