defmodule App.Boards do
  @moduledoc """
  The Boards context.
  """

  import Ecto.Query, warn: false
  alias App.Repo

  alias App.Boards.Board
  alias App.Cards
  alias App.Cards.Card
  alias App.Cards.Edge
  alias App.Boards.Events

  @pubsub App.PubSub

  @doc """
  Returns the list of boards.

  ## Examples

      iex> list_boards()
      [%Board{}, ...]

  """
  def list_boards do
    Repo.all(Board)
  end

  @doc """
  Gets a single board.

  Raises `Ecto.NoResultsError` if the Board does not exist.

  ## Examples

      iex> get_board!(123)
      %Board{}

      iex> get_board!(456)
      ** (Ecto.NoResultsError)

  """
  def get_board!(id), do: Repo.get!(Board, id)

  @doc """
  Creates a board.

  ## Examples

      iex> create_board(%{field: value})
      {:ok, %Board{}}

      iex> create_board(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_board(attrs \\ %{}) do
    %Board{}
    |> Board.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a board.

  ## Examples

      iex> update_board(board, %{field: new_value})
      {:ok, %Board{}}

      iex> update_board(board, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_board(%Board{} = board, attrs) do
    board
    |> Board.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a board.

  ## Examples

      iex> delete_board(board)
      {:ok, %Board{}}

      iex> delete_board(board)
      {:error, %Ecto.Changeset{}}

  """
  def delete_board(%Board{} = board) do
    Repo.delete(board)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking board changes.

  ## Examples

      iex> change_board(board)
      %Ecto.Changeset{data: %Board{}}

  """
  def change_board(%Board{} = board, attrs \\ %{}) do
    Board.changeset(board, attrs)
  end

  def create_card_with_connection_multi(attrs) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:card, Cards.change_card(%Card{}, attrs))
    |> Ecto.Multi.insert(:edge, fn %{card: %{id: next_node_id}} ->
      attrs_with_new_card = attrs |> Map.put("next_node_id", next_node_id)

      Cards.change_edge(%Edge{}, attrs_with_new_card)
    end)
  end

  def delete_card_and_connections_multi!(card_id) do
    card = Cards.get_card!(card_id)

    edge_query =
      from(e in Edge, where: e.previous_node_id == ^card_id or e.next_node_id == ^card_id)

    edges = edge_query |> App.Repo.all()

    Ecto.Multi.new()
    |> Ecto.Multi.delete_all(
      :edges,
      edge_query
    )
    |> Ecto.Multi.delete(:card, card)
    |> Ecto.Multi.put(:board_id, card.board_id)
    |> Ecto.Multi.put(:deleted_edges, edges)
  end

  def delete_card_and_connections!(card_id) do
    card_id
    |> delete_card_and_connections_multi!()
    |> App.Repo.transaction()
    |> case do
      {:ok, %{deleted_edges: edges, card: card, board_id: board_id}} = result ->
        broadcast!(board_id, %Events.CardDeleted{card: card, edges: edges})
        result

      error ->
        error
    end
  end

  def create_card_with_connection(attrs) do
    attrs
    |> create_card_with_connection_multi()
    |> App.Repo.transaction()
    |> case do
      {:ok, %{card: new_card, edge: edge}} = result ->
        broadcast!(new_card.board_id, %Events.CardCreated{card: new_card})
        broadcast!(edge.board_id, %Events.EdgeCreated{edge: edge})
        result

      error ->
        error
    end
  end

  def subscribe_to_board(%Board{} = board) do
    subscribe_to_board(board.id)
  end

  def subscribe_to_board(board_id) when is_binary(board_id) do
    # TODO: @blakedietz 2023-04-10 - topic
    Phoenix.PubSub.subscribe(@pubsub, topic(board_id))
  end

  def unsubscribe_to_board(%Board{} = board) do
    unsubscribe_to_board(board.id)
  end

  def unsubscribe_to_board(board_id) when is_binary(board_id) do
    Phoenix.PubSub.unsubscribe(@pubsub, topic(board_id))
  end

  def broadcast!(board_id, msg) when is_binary(board_id) do
    Phoenix.PubSub.broadcast!(@pubsub, topic(board_id), {__MODULE__, msg})
  end

  defp topic(board_id) when is_binary(board_id), do: "board:#{board_id}"
end
