defmodule App.Cards.Card do
  use Ecto.Schema
  import Ecto.Changeset

  alias App.Boards.Board

  @derive {Jason.Encoder, only: [:x, :y, :notes, :board_id]}
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "cards" do
    field :notes, :string
    belongs_to :board, Board
    field :x, :integer
    field :y, :integer

    timestamps()
  end

  @doc false
  def changeset(card, attrs) do
    card
    |> cast(attrs, [:notes, :board_id, :x, :y])
    |> validate_required([])
  end

  def move_changeset(card, attrs) do
    required_attrs = []
    optional_attrs = [:x, :y]

    card
    |> cast(attrs, required_attrs ++ optional_attrs)
    |> validate_required(required_attrs)
  end
end
