import React, {useState} from 'react';

import{  Text, View, Alert, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { CORES } from "../../theme";
import { DADOS_DIARIO } from './dados';
import { CATEGORIAS_FIXAS } from './dados';
import { estilo } from './styles'


export default function TelaDiario ({ navigation }) {
    const [relatos, setRelatos] = useState(DADOS_DIARIO)
    const [categoria, setCategoria ] = useState('');
    const [descricao, setDescricao ] =useState('');
    const [idEditando, setIdEditando] = useState(null);

  function marcarPagina() {
    if (navigation.canGoBack()) {
      navigation.popToTop();
    }
  }

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

  //alerta de segurança
  const confirmarExclusao = (id) => {
    Alert.alert(
      "Excluir Ocorrência",
      "Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: () => excluirRelato(id) 
        }
      ]
    );
  };

  // Exclui o relato pelo id
  const excluirRelato = (id) => {
    setRelatos(relatos.filter((item) => item.id !== id));
  };

  const renderLeftActions = (item) => {
    return (
      <TouchableOpacity 
        style={[estilo.botaoEditar, { backgroundColor: '#b7f1cf' }]} 
        onPress={() => iniciarEdicao(item)}
      >
        <MaterialCommunityIcons name="pencil-outline" size={19} color="#07ad4d" />
        <Text style={estilo.textoEditar}>Editar</Text>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (item) => {
    return (
      <TouchableOpacity 
        style={[estilo.botaoExcluir, { backgroundColor: '#ffcac5' }]} 
        onPress={() => confirmarExclusao(item.id)}
      >
        <MaterialCommunityIcons  name="trash-can-outline" size={19} color={CORES.vermelho} />
        <Text style={estilo.textoAcaoSwipe}>Excluir</Text>
      </TouchableOpacity>
    );
  };

return (
    <SafeAreaView style={estilo.container}>
      <ScrollView contentContainerStyle={estilo.scrollContent}>
        
           {/* Cabeçalho */}
        <View style={estilo.header}>
          <View>
             <Text style={estilo.tituloCabecalho}>Diário de Ocorrências</Text>
             
          </View>
          <TouchableOpacity style={estilo.botaoMarcaPagina} 
           onPress={marcarPagina}>
            
             <View style={estilo.corteMarcaPagina} />
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

          {/* Campo de Descrição */}
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
          <Swipeable
            key={item.id}
            renderLeftActions ={() => renderLeftActions(item)}
            renderRightActions={() => renderRightActions(item)}
            onSwipeableOpen={(direction) => {
              if (direction === 'left') {
                // Arrastou para a direita -> Editar
                iniciarEdicao(item);
              } else if (direction === 'right') {
                // Arrastou para a esquerda -> Excluir
                confirmarExclusao(item.id);
              }
            }}
          >
          <View style={estilo.card}>
            <View style={estilo.cardHeaderInfo}>
              <Text style={estilo.cardTitulo}>{item.categoria}</Text>
              <Text style={estilo.cardData}>{item.data_ocorrencia}</Text>
            </View>

            <Text style={estilo.cardDescricao}>{item.descricao}</Text>
          </View>
          </Swipeable>
        ))}


        {/* Botão de Voltar */}
        <TouchableOpacity style={estilo.botaoVoltar} onPress={() => navigation.navigate('AreaApoio')}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={estilo.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

