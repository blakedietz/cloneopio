defmodule App.Cards.Edge do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:previous_node_id, :next_node_id, :board_id]}
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "card_edges" do
    field :previous_node_id, :binary_id
    field :next_node_id, :binary_id
    field :board_id, :binary_id

    timestamps()
  end

  @doc false
  def changeset(edge, attrs) do
    edge
    |> cast(attrs, [:previous_node_id, :next_node_id, :board_id])
    |> validate_required([:board_id, :previous_node_id])
  end
end
