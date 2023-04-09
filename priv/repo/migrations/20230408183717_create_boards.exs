defmodule App.Repo.Migrations.CreateBoards do
  use Ecto.Migration

  def change do
    create table(:boards, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps()
    end

    create index(:boards, [:user_id])
  end
end
