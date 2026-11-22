import { CommonActions } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from 'react';

import { Text, View, Alert, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { CORES } from "../../theme";
import { estilo } from './styles'
import api from '../../services/api';
import { obterSessao } from '../../services/sessao';


function formatarData(valor) {
  if (!valor) return '';
  const [data, hora = ''] = String(valor).replace('T', ' ').split(' ');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} ${hora.slice(0, 5)}`.trim();
}

export default function TelaDiario ({ navigation }) {
    const [usuaria, setUsuaria] = useState(null);
    const [relatos, setRelatos] = useState([])
    const [categoria, setCategoria ] = useState('');
    const [descricao, setDescricao ] =useState('');
    const [idEditando, setIdEditando] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

  // READ: busca os relatos da usuária logada na API
  const carregarRelatos = useCallback(async (user) => {
    setCarregando(true);
    setErro('');
    try {
      setRelatos(await api.get(`/diario?user_id=${user.id}`));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const sessao = await obterSessao();
      if (!sessao) {
        setCarregando(false);
        setErro('Faça login novamente para ver seus registros.');
        return;
      }
      setUsuaria(sessao);
      carregarRelatos(sessao);
    })();
  }, [carregarRelatos]);

  // marca-página: volta pra biblioteca
  function marcarPagina() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Biblioteca" }],
      })
    );
  }

  // CREATE / UPDATE
  const salvarRelato = async () => {
    if (!usuaria || salvando) return;
    if (!categoria || !descricao.trim()) {
      Alert.alert('Atenção', 'Escolha uma categoria e descreva o que aconteceu.');
      return;
    }

    setSalvando(true);
    try {
      if (idEditando !== null) {
        // Atualiza o relato existente
        await api.put(`/diario/${idEditando}?user_id=${usuaria.id}`, { categoria, descricao });
        setIdEditando(null);
      } else {
        // Cria um novo relato (a data/hora é gerada automaticamente pelo banco)
        await api.post('/diario', { user_id: usuaria.id, categoria, descricao });
      }
      setCategoria('');
      setDescricao('');
      await carregarRelatos(usuaria);
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setSalvando(false);
    }
  };

  // Preenche os campos para editar
  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setCategoria(item.categoria);
    setDescricao(item.descricao);
  };

  const cancelarEdicao = () => {
    setIdEditando(null);
    setCategoria('');
    setDescricao('');
  };

  //alerta de segurança
  const confirmarExclusao = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza de que deseja excluir este item?')) excluirRelato(id);
      return;
    }
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

  // DELETE: exclui o relato pelo id
  const excluirRelato = async (id) => {
    try {
      await api.delete(`/diario/${id}?user_id=${usuaria.id}`);
      if (idEditando === id) cancelarEdicao();
      await carregarRelatos(usuaria);
    } catch (e) {
      Alert.alert('Não foi possível excluir', e.message);
    }
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
           onPress={marcarPagina}
           accessibilityLabel="Marcar página">
            
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
        <TouchableOpacity style={estilo.botaoSalvar} onPress={salvarRelato} disabled={salvando}>
            <Text style={estilo.textoBotaoSalvar}>
              {salvando ? 'Salvando...' : idEditando !== null ? 'Salvar Alterações' : 'Salvar'}
            </Text>
        </TouchableOpacity>

        {idEditando !== null && (
          <TouchableOpacity onPress={cancelarEdicao} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: CORES.roxo, fontWeight: '700' }}>Cancelar edição</Text>
          </TouchableOpacity>
        )}

        </View>

            <View>
                <Text style={estilo.subtitulo}>Histórico de Ocorrências</Text>
            </View>

        {carregando && <ActivityIndicator color={CORES.roxo} style={{ marginVertical: 16 }} />}

        {!carregando && erro !== '' && (
          <View style={estilo.card}>
            <Text style={{ color: CORES.vermelho }}>{erro}</Text>
            {usuaria && (
              <TouchableOpacity onPress={() => carregarRelatos(usuaria)}>
                <Text style={{ color: CORES.roxo, fontWeight: '700', marginTop: 8 }}>Tentar novamente</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!carregando && erro === '' && relatos.length === 0 && (
          <Text style={{ color: CORES.textoSecundario, marginBottom: 16 }}>Nenhum registro ainda.</Text>
        )}

        {/* Lista de Registros Salvos (vindos da API) */}
        {relatos.map((item) => (
          <Swipeable
            key={item.id}
            renderLeftActions ={() => renderLeftActions(item)}
            renderRightActions={() => renderRightActions(item)}
            onSwipeableOpen={(direction, swipeable) => {
              if (direction === 'left') {
                // Arrastou para a direita -> Editar
                iniciarEdicao(item);
              } else if (direction === 'right') {
                // Arrastou para a esquerda -> Excluir
                confirmarExclusao(item.id);
              }
              swipeable?.close?.();
            }}
          >
          <View style={estilo.card}>
            <View style={estilo.cardHeaderInfo}>
              <Text style={estilo.cardTitulo}>{item.categoria}</Text>
              <Text style={estilo.cardData}>{formatarData(item.data_ocorrencia)}</Text>
            </View>

            <Text style={estilo.cardDescricao}>{item.descricao}</Text>
          </View>
          </Swipeable>
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
