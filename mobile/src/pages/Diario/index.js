import React, {useState} from 'react';

import{  Text, View, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CORES } from "../../theme";
import { DADOS_DIARIO } from './dados';
import { CATEGORIAS_FIXAS } from './dados';
import { estilo } from './styles'


export default function TelaDiario ({ navigation }) {
    const [relatos, setRelatos] = useState(DADOS_DIARIO)
    const [categoria, setCategoria ] = useState('');
    const [descricao, setDescricao ] =useState('');
    const [idEditando, setIdEditando] = useState(null);

  const salvarRelato = () => {
    if (!categoria || !descricao) return;

    if (idEditando !== null) {
      // Atualiza o relato existente
      const relatosAtualizados = relatos.map((item) => {
        if (item.id === idEditando) {
          return { ...item, categoria, descricao };
        }
        return item;
      });
      setRelatos(relatosAtualizados);
      setIdEditando(null);
    } else {
      // Cria um novo relato
      const novoRelato = {
        id: String(Date.now()),
        categoria, 
        descricao,
        data_ocorrencia: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRelatos([novoRelato, ...relatos]);
    }

    setCategoria('');
    setDescricao('');
  };

  // Preenche os campos para editar
  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setCategoria(item.categoria);
    setDescricao(item.descricao);
  };

  // Exclui o relato pelo id
  const excluirRelato = (id) => {
    setRelatos(relatos.filter((item) => item.id !== id));
  };

return (
    <SafeAreaView style={estilo.container}>
      <ScrollView contentContainerStyle={estilo.scrollContent}>
        
           {/* Cabeçalho */}
        <View style={estilo.header}>
          <View>
             <Text style={estilo.tituloCabecalho}>Diário de Ocorrências</Text>
             
          </View>
          <TouchableOpacity style={estilo.botaoMarcaPagina}>
             <Text style={estilo.textoMarcaPagina}>Marca-página</Text>
             <MaterialCommunityIcons name="bookmark-outline" size={16} color={CORES.roxo} />
          </TouchableOpacity>
        </View>

                {/* Bloco de Novo Registro */}
        <View style={estilo.cardFormulario}>
          <Text style={estilo.formTitulo}>{idEditando !== null ? 'Editar registro' : 'Novo registro'}</Text>
          
          {/* Seletor de Categorias fixas */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            { CATEGORIAS_FIXAS.map((cat) => {
              const selecionado = categoria === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  style={{
                    backgroundColor: selecionado ? CORES.roxo : '#F0EEF5',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selecionado ? CORES.roxo : '#DCD6E4'
                  }}
                >
                  <Text style={{ color: selecionado ? '#FFF' : '#444', fontSize: 13, fontWeight: '600' }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[estilo.input, estilo.textArea]}
            placeholder="O que aconteceu?"
            placeholderTextColor="#AFA8B2"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />

        {/* Botão de Salvar */}
        <TouchableOpacity style={estilo.botaoSalvar} onPress={salvarRelato}>
            <Text style={estilo.textoBotaoSalvar}>
              {idEditando !== null ? 'Salvar Alterações' : 'Salvar'}
            </Text>
        </TouchableOpacity>

        </View>

            <View>
                <Text style={estilo.subtitulo}>Histórico de Ocorrências</Text>
            </View>

        {/* Lista de Registros Salvos */}
        {relatos.map((item) => (
          <View key={item.id} style={estilo.card}>
            <View style={estilo.cardHeaderInfo}>
              <Text style={estilo.cardTitulo}>{item.categoria}</Text>
              <Text style={estilo.cardData}>{item.data_ocorrencia}</Text>
            </View>

            <Text style={estilo.cardDescricao}>{item.descricao}</Text>
            
            <View style={estilo.cardBotoes}>
              <TouchableOpacity style={estilo.botaoEditar} onPress={() => iniciarEdicao(item)}>
                 <Text style={estilo.textoEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilo.botaoExcluir} onPress={() => excluirRelato(item.id)}>
                 <Text style={estilo.textoExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}


        {/* Botão de Voltar */}
        <TouchableOpacity style={estilo.botaoVoltar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={estilo.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

