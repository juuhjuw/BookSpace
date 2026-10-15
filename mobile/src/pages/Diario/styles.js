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
  subtituloCabecalho: { 
    fontSize: 13, 
    color: CORES.textoSecundario,
    marginTop: 2
  },
 botaoMarcaPagina: { 
    position: 'absolute',
    top: 0,                   // Toca exatamente na borda superior da tela
    right: 13,                // Distância da borda direita
    width: 48,                // Mais larga
    height: 70,               // Bem comprida para baixo
    backgroundColor: '#F5A623', // Amarelo sólido
    borderBottomLeftRadius: 2,  // Cantos inferiores sutilmente arredondados
    borderBottomRightRadius: 2,
    zIndex: 20,               // Garante que fica por cima de tudo
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 4,
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
    paddingVertical: 6, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: CORES.borda,
    backgroundColor: CORES.branco
  },
  textoEditar: { 
    color: CORES.roxo, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  botaoExcluir: { 
    backgroundColor: CORES.vermelho || '#B22222', 
    paddingVertical: 6, 
    paddingHorizontal: 16, 
    borderRadius: 8 
  },
  textoExcluir: { 
    color: CORES.branco, 
    fontSize: 12, 
    fontWeight: '600' 
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