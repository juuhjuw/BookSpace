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
    fontSize: 12, 
    color: CORES.textoSecundario, 
    marginTop: 4,
    maxWidth: '220' 
  },
  botaoMarcaPagina: { 
    flexDirection: 'row', 
    backgroundColor: '#F0A82F', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    alignItems: 'center',
    gap: 4 
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
    borderColor: CORES.borda 
  },
  textoEditar: { 
    color: CORES.roxo, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  botaoExcluir: { 
    backgroundColor: '#B22222', 
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
    borderWidth: 1, 
    borderColor: CORES.borda, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    color: CORES.texto, 
    backgroundColor: CORES.fundo 
  },
  textArea: { 
    height: 80, 
    textAlignVertical: 'top' 
  },
  botaoSalvar: { 
    backgroundColor: CORES.roxo, 
    borderRadius: 25, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center' 
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
    borderRadius: 25, 
    height: 45,
    gap: 6 
  },
  textoVoltar: { 
    color: CORES.roxo, 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});