defmodule App.BoardsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `App.Boards` context.
  """

  @doc """
  Generate a board.
  """
  def board_fixture(attrs \\ %{}) do
    {:ok, board} =
      attrs
      |> Enum.into(%{
        name: "some name"
      })
      |> App.Boards.create_board()

    board
  end
end
