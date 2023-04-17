defmodule App.Boards.Board do
  use Ecto.Schema
  import Ecto.Changeset

  alias App.Accounts.User
  alias App.Cards.Edge

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "boards" do
    field :name, :string
    belongs_to :user, User
    has_many :card_edges, Edge

    timestamps()
  end

  @doc false
  def changeset(board, attrs) do
    board
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
