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
    path: "/login",
    name: "Login",
    component: {
      template: `
        <div class="card">
          <h1>Login</h1>
          <p>Página de login da aplicação.</p>
        </div>
      `
    }
  },

  {
    path: "/admin",
    name: "Admin",
    component: {
      template: `
        <div class="card">
          <h1>Admin</h1>
          <p>Área administrativa.</p>
        </div>
      `
    }
  },

  {
    path: "/objeto",
    name: "Objeto",
    component: {
      template: `
        <div class="card">
          <h1>Objeto</h1>
          <p>Página de objetos.</p>
        </div>
      `
    }
  },

  {
    path: "/usuarios",
    name: "Usuários",
    component: {
      template: `
        <div class="card">
          <h1>Usuários</h1>
          <p>Lista de usuários do sistema.</p>
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