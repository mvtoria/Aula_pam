import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Button,
  Platform
} from 'react-native';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
        setCarregando(false);
      });
  }, []);

  const adicionarUsuario = () => {
    if (!nome.trim() || !endereco.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o nome e o endereço.'
      );
      return;
    }

    const novoUsuario = {
      id: Date.now().toString(),
      name: nome,
      address: {
        street: endereco,
        suite: '',
        city: '',
      },
    };

    setUsuarios([novoUsuario, ...usuarios]);
    setNome('');
    setEndereco('');
  };

  const excluirUsuario = (id) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        'Tem certeza que deseja excluir este usuário?'
      );

      if (confirmar) {
        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.filter((usuario) => usuario.id !== id)
        );
      }
    } else {
      Alert.alert(
        'Excluir usuário',
        'Tem certeza que deseja excluir este usuário?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            onPress: () => {
              setUsuarios((usuariosAtuais) =>
                usuariosAtuais.filter((usuario) => usuario.id !== id)
              );
            },
          },
        ]
      );
    }
  };

  const alterarUsuario = (id) => {
    const usuario = usuarios.find((usuario) => usuario.id === id);

    setNome(usuario.name);
    setEndereco(usuario.address.street);
    setUsuarioEditando(id);
  };

  const salvarAlteracao = () => {
    if (!nome.trim() || !endereco.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o nome e o endereço.'
      );
      return;
    }

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        'Tem certeza que deseja alterar este usuário?'
      );

      if (confirmar) {
        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.map((usuario) =>
            usuario.id === usuarioEditando
              ? {
                  ...usuario,
                  name: nome,
                  address: {
                    ...usuario.address,
                    street: endereco,
                  },
                }
              : usuario
          )
        );

        setNome('');
        setEndereco('');
        setUsuarioEditando(null);
      }
    } else {
      Alert.alert(
        'Confirmar alteração',
        'Tem certeza que deseja alterar este usuário?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Alterar',
            onPress: () => {
              setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuario) =>
                  usuario.id === usuarioEditando
                    ? {
                        ...usuario,
                        name: nome,
                        address: {
                          ...usuario.address,
                          street: endereco,
                        },
                      }
                    : usuario
                )
              );

              setNome('');
              setEndereco('');
              setUsuarioEditando(null);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Sistema de Cadastro</Text>
      <Text style={styles.subtitulo}>Maria Vitoria e João Pedro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={endereco}
        onChangeText={setEndereco}
      />

      {usuarioEditando === null ? (
        <Button
          title="Adicionar usuário"
          onPress={adicionarUsuario}
          color="#8f7ff7"
        />
      ) : (
        <>
          <Button
            title="Salvar alteração"
            onPress={salvarAlteracao}
            color="#2bb815"
          />

          <Button
            title="Cancelar"
            onPress={() => {
              setNome('');
              setEndereco('');
              setUsuarioEditando(null);
            }}
            color="#df2929"
          />
        </>
      )}

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#c285ff"
        />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>
                {item.name}
              </Text>

              <Text style={styles.endereco}>
                {item.address.street}
                {item.address.suite
                  ? `, ${item.address.suite}`
                  : ''}
                {item.address.city
                  ? ` - ${item.address.city}`
                  : ''}
              </Text>

              <Button
                title="Alterar"
                onPress={() => alterarUsuario(item.id)}
                color="#1e54ab"
              />

              <Button
                title="Excluir"
                onPress={() => excluirUsuario(item.id)}
                color="#df2929"
              />
            </View>
          )}
          style={styles.lista}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260360',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#bdaef4',
  },

  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 20,
    color: '#bdaef4',
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  lista: {
    width: '100%',
    marginTop: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0e3987',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  endereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

