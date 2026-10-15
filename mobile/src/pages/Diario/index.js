import React, {useState} from 'react';

import{  Text, View, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CORES } from "../../theme";
import { DADOS_DIARIO } from './dados';
import { estilo } from './styles'


export default function TelaDiario ({ navigation }) {
    const [relatos, setRelatos] = useState(DADOS_DIARIO)
    const [titulo, setTitulo ] = useState('');
    const [descricao, setDescricao ] =useState('');
    const [idEditando, setIdEditando] = useState(null);

  const salvarRelato = () => {
    if (!titulo || !descricao) return;

    if (idEditando !== null) {
      // Atualiza o relato existente
      const relatosAtualizados = relatos.map((item) => {
        if (item.id === idEditando) {
          return { ...item, titulo, descricao };
        }
        return item;
      });
      setRelatos(relatosAtualizados);
      setIdEditando(null);
    } else {
      // Cria um novo relato
      const novoRelato = {
        id: String(Date.now()),
        titulo, 
        descricao,
        data_ocorrencia: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRelatos([novoRelato, ...relatos]);
    }

    setTitulo('');
    setDescricao('');
  };

  // Preenche os campos para editar
  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setTitulo(item.titulo);
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
             <Text style={estilo.subtituloCabecalho}>Anotações de Leitura</Text>
          </View>
          <TouchableOpacity style={estilo.botaoMarcaPagina}>
             <Text style={estilo.textoMarcaPagina}>Marca-página</Text>
             <MaterialCommunityIcons name="bookmark-outline" size={16} color={CORES.roxo} />
          </TouchableOpacity>
        </View>

        {/* Lista de Registros Salvos */}
        {relatos.map((item) => (
          <View key={item.id} style={estilo.card}>
            <View style={estilo.cardHeaderInfo}>
              <Text style={estilo.cardTitulo}>{item.titulo}</Text>
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

        {/* Bloco de Novo Registro */}
        <View style={estilo.cardFormulario}>
          <Text style={estilo.formTitulo}>{idEditando !== null ? 'Editar registro' : 'Novo registro'}</Text>
          
          <TextInput
            style={estilo.input}
            placeholder="Título"
            placeholderTextColor="#AFA8B2"
            value={titulo}
            onChangeText={setTitulo}
          />

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

        {/* Botão de Voltar */}
        <TouchableOpacity style={estilo.botaoVoltar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={estilo.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

