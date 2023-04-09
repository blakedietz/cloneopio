defmodule App.Repo.Migrations.CreateCards do
  use Ecto.Migration

  def change do
    create table(:cards, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:notes, :text)
      add(:board_id, references(:boards, on_delete: :delete_all, type: :binary_id))
      add(:user_id, references(:users, on_delete: :delete_all, type: :binary_id))
      add(:x, :integer, null: false)
      add(:y, :integer, null: false)

      timestamps()
    end

    create(index(:cards, [:board_id]))
  end
end
