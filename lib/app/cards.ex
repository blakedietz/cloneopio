defmodule App.Cards do
  @moduledoc """
  The Cards context.
  """

  import Ecto.Query, warn: false

  alias App.Boards
  alias App.Boards.Events
  alias App.Cards.Card
  alias App.Cards.Edge
  alias App.Repo

  @doc """
  Returns the list of cards.

  ## Examples

      iex> list_cards()
      [%Card{}, ...]

  """
  def list_cards do
    Repo.all(Card)
  end

  @doc """
  Gets a single card.

  Raises `Ecto.NoResultsError` if the Card does not exist.

  ## Examples

      iex> get_card!(123)
      %Card{}

      iex> get_card!(456)
      ** (Ecto.NoResultsError)

  """
  def get_card!(id), do: Repo.get!(Card, id)

  @doc """
  Creates a card.

  ## Examples

      iex> create_card(%{field: value})
      {:ok, %Card{}}

      iex> create_card(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_card(attrs \\ %{}) do
    %Card{}
    |> Card.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, new_card} = result ->
        Boards.broadcast!(new_card.board_id, %Events.CardCreated{card: new_card})
        result

      error ->
        error
    end
  end

  @doc """
  Updates a card.

  ## Examples

      iex> update_card(card, %{field: new_value})
      {:ok, %Card{}}

      iex> update_card(card, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_card(%Card{} = card, attrs) do
    card
    |> Card.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, card} = result ->
        Boards.broadcast!(card.board_id, %Events.CardUpdated{card: card})
        result

      error ->
        error
    end
  end

  @doc """
  Deletes a card.

  ## Examples

      iex> delete_card(card)
      {:ok, %Card{}}

      iex> delete_card(card)
      {:error, %Ecto.Changeset{}}

  """
  def delete_card(%Card{} = card) do
    Repo.delete(card)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking card changes.

  ## Examples

      iex> change_card(card)
      %Ecto.Changeset{data: %Card{}}

  """
  def change_card(%Card{} = card, attrs \\ %{}) do
    Card.changeset(card, attrs)
  end

  def move_card(%Card{} = card, attrs) do
    card
    |> Card.move_changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, card} = result ->
        Boards.broadcast!(card.board_id, %Events.CardMoved{card: card})
        result

      error ->
        error
    end
  end

  def list_cards_for_board_query(board_id) do
    from(c in Card, where: c.board_id == ^board_id)
  end

  def list_cards_for_board(board_id) do
    list_cards_for_board_query(board_id)
    |> Repo.all()
  end

  alias App.Cards.Edge

  @doc """
  Returns the list of card_edges.

  ## Examples

      iex> list_card_edges()
      [%Edge{}, ...]

  """
  def list_card_edges do
    Repo.all(Edge)
  end

  def list_edges_for_board_query(board_id) do
    from(e in Edge, where: e.board_id == ^board_id)
  end

  def list_edges_for_board(board_id) do
    list_edges_for_board_query(board_id)
    |> Repo.all()
  end

  @doc """
  Gets a single edge.

  Raises `Ecto.NoResultsError` if the Edge does not exist.

  ## Examples

      iex> get_edge!(123)
      %Edge{}

      iex> get_edge!(456)
      ** (Ecto.NoResultsError)

  """
  def get_edge!(id), do: Repo.get!(Edge, id)

  @doc """
  Creates a edge.

  ## Examples

      iex> create_edge(%{field: value})
      {:ok, %Edge{}}

      iex> create_edge(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_edge(attrs \\ %{}) do
    %Edge{}
    |> Edge.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, edge} = result ->
        Boards.broadcast!(edge.board_id, %Events.EdgeCreated{edge: edge})
        result

      error ->
        error
    end
  end

  @doc """
  Updates a edge.

  ## Examples

      iex> update_edge(edge, %{field: new_value})
      {:ok, %Edge{}}

      iex> update_edge(edge, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_edge(%Edge{} = edge, attrs) do
    edge
    |> Edge.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a edge.

  ## Examples

      iex> delete_edge(edge)
      {:ok, %Edge{}}

      iex> delete_edge(edge)
      {:error, %Ecto.Changeset{}}

  """
  def delete_edge(%Edge{} = edge) do
    Repo.delete(edge)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking edge changes.

  ## Examples

      iex> change_edge(edge)
      %Ecto.Changeset{data: %Edge{}}

  """
  def change_edge(%Edge{} = edge, attrs \\ %{}) do
    Edge.changeset(edge, attrs)
  end
end
