defmodule App.Repo.Migrations.CreateCardEdges do
  use Ecto.Migration

  def change do
    create table(:card_edges, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :previous_node_id, references(:cards, on_delete: :nothing, type: :binary_id)
      add :next_node_id, references(:cards, on_delete: :nothing, type: :binary_id)
      add :board_id, references(:boards, on_delete: :nothing, type: :binary_id)

      timestamps()
    end

    create index(:card_edges, [:previous_node_id])
    create index(:card_edges, [:next_node_id])
    create index(:card_edges, [:board_id])
    create unique_index(:card_edges, [:previous_node_id, :next_node_id])
  end
end
