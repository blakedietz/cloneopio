defmodule App.CardsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `App.Cards` context.
  """

  @doc """
  Generate a card.
  """
  def card_fixture(attrs \\ %{}) do
    {:ok, card} =
      attrs
      |> Enum.into(%{
        notes: "some notes"
      })
      |> App.Cards.create_card()

    card
  end

  @doc """
  Generate a edge.
  """
  def edge_fixture(attrs \\ %{}) do
    {:ok, edge} =
      attrs
      |> Enum.into(%{

      })
      |> App.Cards.create_edge()

    edge
  end
end
