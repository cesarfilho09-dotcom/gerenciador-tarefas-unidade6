const routes = [
  {
  path: "/",
  name: "Inicial",
  component: {
    data() {
      return {
        tarefas: [],
        titulo: "",
        descricao: "",
        carregando: false,
        erro: ""
      };
    },

    mounted() {
      this.carregarTarefas();
    },

    methods: {
      async carregarTarefas() {
        this.carregando = true;
        this.erro = "";

        try {
          const resposta = await fetch("/tarefas/vue/tarefas");

          if (!resposta.ok) {
            throw new Error("Não foi possível carregar as tarefas.");
          }

          this.tarefas = await resposta.json();
        } catch (erro) {
          this.erro = erro.message;
        } finally {
          this.carregando = false;
        }
      },

      async cadastrarTarefa() {
        this.erro = "";

        if (!this.titulo.trim()) {
          this.erro = "Digite o título da tarefa.";
          return;
        }

        try {
          const resposta = await fetch("/tarefas/vue/tarefas", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              titulo: this.titulo,
              descricao: this.descricao
            })
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao cadastrar tarefa.");
          }

          this.titulo = "";
          this.descricao = "";

          await this.carregarTarefas();
        } catch (erro) {
          this.erro = erro.message;
        }
      },

      async alternarStatus(tarefa) {
        this.erro = "";

        try {
          const resposta = await fetch(
            `/tarefas/vue/tarefas/${tarefa.id}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                status: tarefa.status === "pendente"
                  ? "concluida"
                  : "pendente"
              })
            }
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao alterar o status.");
          }

          await this.carregarTarefas();
        } catch (erro) {
          this.erro = erro.message;
        }
      }
    },

    template: `
      <div>

        <div class="card">
          <h1>Gerenciador de Tarefas</h1>
          <p>Bem-vindo ao Gerenciador de Tarefas!</p>

          <p v-if="carregando" class="carregando">
            Carregando tarefas...
          </p>

          <div v-if="erro" class="erro">
            {{ erro }}
          </div>
        </div>

        <div class="card">
          <h2>Nova tarefa</h2>

          <form @submit.prevent="cadastrarTarefa">

            <label for="titulo">Título:</label>

            <input
              id="titulo"
              type="text"
              v-model="titulo"
              placeholder="Digite o título da tarefa"
            >

            <label for="descricao">Descrição:</label>

            <textarea
              id="descricao"
              v-model="descricao"
              placeholder="Digite a descrição da tarefa"
            ></textarea>

            <button type="submit">
              Cadastrar tarefa
            </button>

          </form>
        </div>

        <div class="card">

          <h2>Tarefas cadastradas</h2>

          <p v-if="!carregando && tarefas.length === 0">
            Nenhuma tarefa cadastrada.
          </p>

          <div
            v-for="tarefa in tarefas"
            :key="tarefa.id"
            class="tarefa"
            :class="{ concluida: tarefa.status === 'concluida' }"
          >

            <h3>{{ tarefa.titulo }}</h3>

            <p>
              {{ tarefa.descricao || 'Sem descrição' }}
            </p>

            <span
              class="status"
              :class="tarefa.status === 'concluida'
                ? 'concluida'
                : 'pendente'"
            >
              {{ tarefa.status === 'concluida'
                ? 'Concluída'
                : 'Pendente' }}
            </span>

            <br>

            <button @click="alternarStatus(tarefa)">
              {{ tarefa.status === 'concluida'
                ? 'Marcar como pendente'
                : 'Concluir tarefa' }}
            </button>

          </div>

        </div>

      </div>
    `
  }
},
{
  path: "/objetos",
  name: "Objetos",
  component: {
    data() {
      return {
        objetos: [],
        pagina: 1,
        limite: 5,
        totalPaginas: 1,
        erro: "",
        carregando: false
      };
    },

    mounted() {
      this.carregarObjetos();
    },

    methods: {
      async carregarObjetos() {
        this.carregando = true;
        this.erro = "";

        try {
          const resposta = await fetch(
            `/objetos?pagina=${this.pagina}&limite=${this.limite}`,
            {
              headers: {
                "Accept": "application/json"
              }
            }
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(
              dados.erro || "Erro ao carregar objetos."
            );
          }

          this.objetos = dados.objetos;
          this.totalPaginas = dados.totalPaginas;

        } catch (erro) {
          this.erro = erro.message;

        } finally {
          this.carregando = false;
        }
      },

      mudarPagina(novaPagina) {
        if (
          novaPagina < 1 ||
          novaPagina > this.totalPaginas
        ) {
          return;
        }

        this.pagina = novaPagina;
        this.carregarObjetos();
      },

      verDetalhes(id) {
        this.$router.push(`/detalhes/${id}`);
      }
    },

    template: `
      <div class="card">
        <h1>Lista de Objetos</h1>

        <div v-if="carregando" class="carregando">
          Carregando objetos...
        </div>

        <div v-if="erro" class="erro">
          {{ erro }}
        </div>

        <div
          v-for="objeto in objetos"
          :key="objeto.id"
          class="tarefa"
        >
          <h3>{{ objeto.titulo }}</h3>

          <p>
            {{ objeto.descricao || "Sem descrição." }}
          </p>

          <p>
            <strong>Status:</strong>
            {{ objeto.status }}
          </p>

          <button @click="verDetalhes(objeto.id)">
            Ver detalhes
          </button>
        </div>

        <div v-if="!carregando && objetos.length === 0">
          Nenhum objeto encontrado.
        </div>

        <div v-if="totalPaginas > 1">
          <button
            @click="mudarPagina(pagina - 1)"
            :disabled="pagina === 1"
          >
            Anterior
          </button>

          <span>
            Página {{ pagina }} de {{ totalPaginas }}
          </span>

          <button
            @click="mudarPagina(pagina + 1)"
            :disabled="pagina === totalPaginas"
          >
            Próxima
          </button>
        </div>
      </div>
    `
  }
},
  {
    path: "/detalhes",
    name: "Detalhes",
    component: {
      template: `
        <div class="card">
          <h1>Detalhes</h1>
          <p>Página de detalhes do sistema.</p>
        </div>
      `
    }
  },
{
  path: "/detalhes/:id",
  name: "DetalhesObjeto",
  component: {
    data() {
      return {
        objeto: null,
        erro: "",
        carregando: false
      };
    },

    mounted() {
      this.carregarDetalhes();
    },

    methods: {
      async carregarDetalhes() {
        this.carregando = true;
        this.erro = "";

        try {
          const resposta = await fetch(
            `/objetos/${this.$route.params.id}`,
            {
              headers: {
                "Accept": "application/json"
              }
            }
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(
              dados.erro || "Objeto não encontrado."
            );
          }

          this.objeto = dados;

        } catch (erro) {
          this.erro = erro.message;

        } finally {
          this.carregando = false;
        }
      }
    },

    template: `
      <div class="card">
        <h1>Detalhes do Objeto</h1>

        <div v-if="carregando" class="carregando">
          Carregando...
        </div>

        <div v-if="erro" class="erro">
          {{ erro }}
        </div>

        <div v-if="objeto">
          <h2>{{ objeto.titulo }}</h2>

          <p>
            <strong>Descrição:</strong>
            {{ objeto.descricao || "Sem descrição." }}
          </p>

          <p>
            <strong>Status:</strong>
            {{ objeto.status }}
          </p>

          <p>
            <strong>Usuário:</strong>
            {{ objeto.usuarioId }}
          </p>

          <button @click="$router.push('/objetos')">
            Voltar para objetos
          </button>
        </div>
      </div>
    `
  }
},
 {
  path: "/login",
  name: "Login",
  component: {
    data() {
      return {
        email: "",
        senha: "",
        erro: "",
        carregando: false
      };
    },

    methods: {
      async fazerLogin() {
        this.erro = "";
        this.carregando = true;

        try {
          const resposta = await fetch("/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: this.email,
              senha: this.senha
            })
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao fazer login.");
          }

          sessionStorage.setItem("token", dados.token);
          sessionStorage.setItem(
            "usuario",
            JSON.stringify(dados.usuario)
          );

          this.$router.push("/admin");

        } catch (erro) {
          this.erro = erro.message;
        } finally {
          this.carregando = false;
        }
      }
    },

    template: `
      <div class="card">
        <h1>Login</h1>

        <form @submit.prevent="fazerLogin">

          <label for="email">E-mail:</label>

          <input
            id="email"
            type="email"
            v-model="email"
            placeholder="Digite seu e-mail"
            required
          >

          <label for="senha">Senha:</label>

          <input
            id="senha"
            type="password"
            v-model="senha"
            placeholder="Digite sua senha"
            required
          >

          <button type="submit" :disabled="carregando">
            {{ carregando ? "Entrando..." : "Entrar" }}
          </button>

        </form>

        <div v-if="erro" class="erro">
          {{ erro }}
        </div>
      </div>
    `
  }
},

  {
  path: "/admin",
  name: "Admin",
  component: {
    data() {
      return {
        usuario: null
      };
    },

  mounted() {
  const token = sessionStorage.getItem("token");
  const usuarioSalvo = sessionStorage.getItem("usuario");

  if (!token || !usuarioSalvo) {
    this.$router.push("/login");
    return;
  }

  try {
    const usuario = JSON.parse(usuarioSalvo);

    if (usuario.perfil !== "admin") {
      alert("Acesso permitido somente para administradores.");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");
      this.$router.push("/login");
      return;
    }

    this.usuario = usuario;

  } catch (erro) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    this.$router.push("/login");
  }
},

    methods: {
      sair() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");

        this.$router.push("/login");
      }
    },

    template: `
      <div>

        <div class="card">
          <h1>Área Administrativa</h1>

          <p v-if="usuario">
            Bem-vindo, <strong>{{ usuario.nome }}</strong>!
          </p>

          <p>
            Escolha uma opção abaixo:
          </p>

          <button @click="$router.push('/objeto')">
            Cadastro de Objetos
          </button>

          <button @click="$router.push('/usuarios')">
            Cadastro de Usuários
          </button>

          <br>

          <button @click="sair">
            Sair
          </button>
        </div>

      </div>
    `
  }
},

 {
  path: "/objeto",
  name: "Objeto",
  component: {
    data() {
  return {
    objetos: [],
    erro: "",
    carregando: false,
    titulo: "",
    descricao: "",
    status: "pendente",
    usuarioId: "",
    editandoId: null,
    filtro: "todas"
  };
},

    mounted() {
      this.carregarObjetos();
    },

computed: {
  objetosFiltrados() {
    if (this.filtro === "pendentes") {
      return this.objetos.filter(objeto => objeto.status === "pendente");
    }

    if (this.filtro === "concluidas") {
      return this.objetos.filter(objeto => objeto.status === "concluida");
    }

    return this.objetos;
  }
},
    methods: {
      async carregarObjetos() {
        const token = sessionStorage.getItem("token");

        if (!token) {
          this.$router.push("/login");
          return;
        }

        this.carregando = true;
        this.erro = "";

        try {
          const resposta = await fetch("/admin/objetos", {
            headers: {
              Authorization: "Bearer " + token
            }
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao carregar objetos.");
          }

          this.objetos = dados;

        } catch (erro) {
          this.erro = erro.message;
        } finally {
          this.carregando = false;
        }
      },

      async cadastrarObjeto() {
        const token = sessionStorage.getItem("token");

        this.erro = "";

        if (!this.titulo.trim()) {
          this.erro = "Digite o título do objeto.";
          return;
        }

        try {
          const resposta = await fetch("/admin/objetos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token
            },
            body: JSON.stringify({
              titulo: this.titulo,
              descricao: this.descricao,
              status: this.status,
              usuarioId: this.usuarioId
            })
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao cadastrar objeto.");
          }

          this.titulo = "";
          this.descricao = "";
          this.status = "pendente";
          this.usuarioId = "";

          await this.carregarObjetos();

        } catch (erro) {
          this.erro = erro.message;
        }
      },
      
async editarObjeto(objeto) {
  this.editandoId = objeto.id;
  this.titulo = objeto.titulo;
  this.descricao = objeto.descricao || "";
  this.status = objeto.status;
  this.usuarioId = objeto.usuarioId;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
},

async salvarEdicao() {
  const token = sessionStorage.getItem("token");

  try {
    const resposta = await fetch(
      "/admin/objetos/" + this.editandoId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          titulo: this.titulo,
          descricao: this.descricao,
          status: this.status,
          usuarioId: Number(this.usuarioId)
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "Erro ao editar objeto."
      );
    }

    this.titulo = "";
    this.descricao = "";
    this.status = "pendente";
    this.usuarioId = "";
    this.editandoId = null;

    await this.carregarObjetos();

  } catch (erro) {
    this.erro = erro.message;
  }
},

cancelarEdicao() {
  this.titulo = "";
  this.descricao = "";
  this.status = "pendente";
  this.usuarioId = "";
  this.editandoId = null;
},
      async excluirObjeto(id) {
        const token = sessionStorage.getItem("token");

        if (!confirm("Deseja realmente excluir este objeto?")) {
          return;
        }

        try {
          const resposta = await fetch(
            "/admin/objetos/" + id,
            {
              method: "DELETE",
              headers: {
                Authorization: "Bearer " + token
              }
            }
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao excluir objeto.");
          }

          await this.carregarObjetos();

        } catch (erro) {
          this.erro = erro.message;
        }
      }
    },

    template: `
      <div>

        <div class="card">
          <h1>Cadastro de Objetos</h1>
<label for="filtro">Filtrar tarefas:</label>

<select id="filtro" v-model="filtro">
  <option value="todas">Todas</option>
  <option value="pendentes">Pendentes</option>
  <option value="concluidas">Concluídas</option>
</select>
          <button @click="$router.push('/admin')">
            Voltar
          </button>
        </div>

        <div class="card">

          <h2>Novo objeto</h2>

          <h2>
  {{ editandoId ? "Editar objeto" : "Novo objeto" }}
</h2>

<form
  @submit.prevent="
    editandoId
      ? salvarEdicao()
      : cadastrarObjeto()
  "
>

            <label>Título:</label>

            <input
              type="text"
              v-model="titulo"
              placeholder="Digite o título"
              required
            >

            <label>Descrição:</label>

            <textarea
              v-model="descricao"
              placeholder="Digite a descrição"
            ></textarea>

            <label>Status:</label>

            <select v-model="status">
              <option value="pendente">Pendente</option>
              <option value="concluida">Concluída</option>
            </select>

            <label>ID do usuário:</label>

            <input
              type="number"
              v-model="usuarioId"
              placeholder="ID do usuário"
              required
            >

            <button type="submit">
  {{ editandoId ? "Salvar alterações" : "Cadastrar objeto" }}
</button>

<button
  v-if="editandoId"
  type="button"
  @click="cancelarEdicao"
>
  Cancelar
</button>

          </form>

        </div>

        <div class="card">

          <h2>Objetos cadastrados</h2>

          <p v-if="carregando">
            Carregando...
          </p>

          <div v-if="erro" class="erro">
            {{ erro }}
          </div>

          <TransitionGroup name="lista" tag="div">

  <div v-for="objeto in objetosFiltrados" :key="objeto.id" class="tarefa">

    <h3>{{ objeto.titulo }}</h3>

    <p>
      {{ objeto.descricao || "Sem descrição" }}
    </p>

    <p>
      Status: {{ objeto.status }}
    </p>

    <p>
      Usuário: {{ objeto.usuarioId }}
    </p>

    <button @click="editarObjeto(objeto)">
      Editar
    </button>

    <button @click="excluirObjeto(objeto.id)">
      Excluir
    </button>

  </div>

</TransitionGroup>

<p v-if="!carregando && objetosFiltrados.length === 0">
  Nenhum objeto cadastrado.
</p>
        </div>
      </div>
    `
  }
},

 {
  path: "/usuarios",
  name: "Usuários",
  component: {
    data() {
     return {
  usuarios: [],
  nome: "",
  email: "",
  senha: "",
  perfil: "usuario",
  erro: "",
  carregando: false,
  editandoId: null
};
    },

    mounted() {
      this.carregarUsuarios();
    },

    methods: {
      async carregarUsuarios() {
        const token = sessionStorage.getItem("token");

        if (!token) {
          this.$router.push("/login");
          return;
        }

        this.carregando = true;
        this.erro = "";

        try {
          const resposta = await fetch("/admin/usuarios", {
            headers: {
              Authorization: "Bearer " + token
            }
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(
              dados.erro || "Erro ao carregar usuários."
            );
          }

          this.usuarios = dados;

        } catch (erro) {
          this.erro = erro.message;
        } finally {
          this.carregando = false;
        }
      },

      async cadastrarUsuario() {
        const token = sessionStorage.getItem("token");

        this.erro = "";

        if (!this.nome.trim() || !this.email.trim() || !this.senha) {
          this.erro = "Preencha todos os campos obrigatórios.";
          return;
        }

        try {
          const resposta = await fetch("/admin/usuarios", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token
            },
            body: JSON.stringify({
              nome: this.nome,
              email: this.email,
              senha: this.senha,
              perfil: this.perfil
            })
          });

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(
              dados.erro || "Erro ao cadastrar usuário."
            );
          }

          this.nome = "";
          this.email = "";
          this.senha = "";
          this.perfil = "usuario";

          await this.carregarUsuarios();

        } catch (erro) {
          this.erro = erro.message;
        }
      },
async editarUsuario(usuario) {
  this.editandoId = usuario.id;
  this.nome = usuario.nome;
  this.email = usuario.email;
  this.senha = "";
  this.perfil = usuario.perfil;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
},

async salvarEdicao() {
  const token = sessionStorage.getItem("token");

  try {
    const resposta = await fetch(
      "/admin/usuarios/" + this.editandoId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          nome: this.nome,
          email: this.email,
          senha: this.senha,
          perfil: this.perfil
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "Erro ao editar usuário."
      );
    }

    this.nome = "";
    this.email = "";
    this.senha = "";
    this.perfil = "usuario";
    this.editandoId = null;

    await this.carregarUsuarios();

  } catch (erro) {
    this.erro = erro.message;
  }
},

cancelarEdicao() {
  this.nome = "";
  this.email = "";
  this.senha = "";
  this.perfil = "usuario";
  this.editandoId = null;
},
      async excluirUsuario(id) {
        const token = sessionStorage.getItem("token");

        if (!confirm("Deseja realmente excluir este usuário?")) {
          return;
        }

        try {
          const resposta = await fetch(
            "/admin/usuarios/" + id,
            {
              method: "DELETE",
              headers: {
                Authorization: "Bearer " + token
              }
            }
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            throw new Error(
              dados.erro || "Erro ao excluir usuário."
            );
          }

          await this.carregarUsuarios();

        } catch (erro) {
          this.erro = erro.message;
        }
      }
    },

    template: `
      <div>

        <div class="card">

          <h1>Cadastro de Usuários</h1>

          <button @click="$router.push('/admin')">
            Voltar
          </button>

        </div>

        <div class="card">

          <h2>
  {{ editandoId ? "Editar usuário" : "Novo usuário" }}
</h2>

          <form
  @submit.prevent="
    editandoId
      ? salvarEdicao()
      : cadastrarUsuario()
  "
>

            <label>Nome:</label>

            <input
              type="text"
              v-model="nome"
              placeholder="Digite o nome"
              required
            >

            <label>E-mail:</label>

            <input
              type="email"
              v-model="email"
              placeholder="Digite o e-mail"
              required
            >

            <label>Senha:</label>

            <input
              type="password"
              v-model="senha"
              placeholder="Digite a senha"
              required
            >

            <label>Perfil:</label>

            <select v-model="perfil">
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>

           <button type="submit">
  {{ editandoId ? "Salvar alterações" : "Cadastrar usuário" }}
</button>

<button
  v-if="editandoId"
  type="button"
  @click="cancelarEdicao"
>
  Cancelar
</button>

          </form>

        </div>

        <div class="card">

          <h2>Usuários cadastrados</h2>

          <p v-if="carregando">
            Carregando...
          </p>

          <div v-if="erro" class="erro">
            {{ erro }}
          </div>

          <div
            v-for="usuario in usuarios"
            :key="usuario.id"
            class="tarefa"
          >

            <h3>{{ usuario.nome }}</h3>

            <p>
              E-mail: {{ usuario.email }}
            </p>

            <p>
              Perfil: {{ usuario.perfil }}
            </p>

            <button @click="editarUsuario(usuario)">
  Editar
</button>

<button @click="excluirUsuario(usuario.id)">
  Excluir
</button>

          </div>

          <p v-if="!carregando && usuarios.length === 0">
            Nenhum usuário cadastrado.
          </p>

        </div>

      </div>
    `
  }
},

  {
    path: "/autor",
    name: "Autor",
    component: {
      template: `
        <div class="card">
          <h1>Autor</h1>
          <p>Página do autor da aplicação.</p>
        </div>
      `
    }
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});